// POST /stripe-webhook  (events: checkout.session.completed, checkout.session.expired)
// On payment: re-checks the slot (one boat), marks the booking paid, adds it to Google Calendar,
// builds the signed waiver PDF and emails it to the company and the customer.
// If the slot was taken meanwhile, the payment is refunded automatically and both sides are told.
// Every step is safe to retry (Stripe retries failed webhooks).
import { db, env, overlaps, TIMEZONE } from '../_shared/common.ts';
import { createEvent, googleBusy } from '../_shared/google.ts';
import { stripe, verifyStripeSignature } from '../_shared/stripe.ts';
import { buildWaiverPdf } from '../_shared/pdf.ts';
import { esc, layout, row, sendMail } from '../_shared/email.ts';
import { tours } from '../_shared/booking-texts.ts';

const fmt = (iso: string, lang: string) => {
  const d = new Date(iso), loc = lang === 'es' ? 'es-PR' : 'en-US';
  return {
    date: d.toLocaleDateString(loc, { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(loc, { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' }),
  };
};
const toB64 = (bytes: Uint8Array) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

Deno.serve(async req => {
  const raw = await req.text();
  if (!(await verifyStripeSignature(raw, req.headers.get('stripe-signature')))) return new Response('bad signature', { status: 400 });
  const event = JSON.parse(raw);
  const session = event.data?.object;
  const bookingId = session?.metadata?.booking_id ?? session?.client_reference_id;
  if (!bookingId) return new Response('ignored');
  const client = db();

  try {
    if (event.type === 'checkout.session.expired') {
      await client.from('bookings').update({ status: 'expired' }).eq('id', bookingId).eq('status', 'pending');
      return new Response('ok');
    }
    if (event.type !== 'checkout.session.completed' || session.payment_status !== 'paid') return new Response('ignored');

    let { data: b } = await client.from('bookings').select('*').eq('id', bookingId).single();
    if (!b || b.status === 'refunded' || b.status === 'cancelled') return new Response('ok');
    const company = env('COMPANY_EMAIL', false) || 'boattoursshaddai@gmail.com';
    const lang = b.lang === 'es' ? 'es' : 'en';
    const tour = tours.find(t => t.id === b.tour_id);
    const tourName = tour ? tour[lang].name : b.tour_name;
    const when = fmt(b.start_ts, lang);

    // 1) Confirm the slot and mark paid (the database also blocks overlapping paid trips).
    if (b.status !== 'paid') {
      const g = await googleBusy(new Date(new Date(b.start_ts).getTime() - 86_400_000).toISOString(), new Date(new Date(b.end_ts).getTime() + 86_400_000).toISOString()).catch(() => []);
      let conflict = overlaps(new Date(b.start_ts), new Date(b.end_ts), g);
      if (!conflict) {
        const { error } = await client.from('bookings').update({ status: 'paid', paid_at: new Date().toISOString(), stripe_payment_intent: session.payment_intent }).eq('id', b.id);
        if (error) { if (error.code === '23P01') conflict = true; else throw error; } // 23P01 = exclusion violation (overlap)
      }
      if (conflict) {
        await stripe('refunds', { payment_intent: session.payment_intent, reason: 'duplicate', metadata: { booking_id: b.id } }, 'POST', `refund-${b.id}`);
        await client.from('bookings').update({ status: 'refunded', stripe_payment_intent: session.payment_intent, notes: 'Slot taken before payment completed; refunded automatically.' }).eq('id', b.id);
        await sendMail({ to: [b.lead_email], replyTo: company,
          subject: lang === 'es' ? 'Tu pago fue reembolsado — fecha no disponible' : 'Your payment was refunded — date no longer available',
          html: layout(lang === 'es' ? 'Fecha no disponible' : 'Date no longer available', `<p>${lang === 'es'
            ? `Hola ${esc(b.lead_name)}, alguien completó el pago de <b>${esc(when.date)}</b> unos segundos antes que tú. Reembolsamos tu pago completo automáticamente (puede tardar 5–10 días en verse). Escríbenos y te ayudamos a escoger otra fecha.`
            : `Hi ${esc(b.lead_name)}, someone completed payment for <b>${esc(when.date)}</b> moments before you. We refunded your full payment automatically (it can take 5–10 days to appear). Reply to this email and we will help you pick another date.`}</p>`) }).catch(console.error);
        await sendMail({ to: [company], subject: `Auto-refund: double booking attempt ${when.date}`, html: layout('Automatic refund', `<p>${esc(b.lead_name)} (${esc(b.lead_email)}, ${esc(b.lead_phone)}) paid for ${esc(tourName)} on ${esc(when.date)} ${esc(when.time)}, but the slot was already taken. The payment was refunded automatically. You may want to contact them to offer another date.</p>`) }).catch(console.error);
        return new Response('refunded');
      }
      b = { ...b, status: 'paid', stripe_payment_intent: session.payment_intent };
    }

    // 2) Google Calendar event.
    if (!b.calendar_event_id) {
      const eventId = await createEvent({
        summary: `⛵ ${b.tour_name} — ${b.lead_name} (${b.passengers} pax)`,
        start: b.start_ts, end: b.end_ts,
        description: `PAID $${(b.amount_cents / 100).toFixed(2)} via Stripe\nPassengers: ${b.passengers}\nContact: ${b.lead_name} · ${b.lead_phone} · ${b.lead_email}\nEmergency: ${b.emergency?.name} · ${b.emergency?.phone}\nWaiver: signed online (PDF emailed to ${company})\nBooking ID: ${b.id}`,
      });
      if (eventId) await client.from('bookings').update({ calendar_event_id: eventId }).eq('id', b.id);
    }

    // 3) Signed waiver PDF + emails.
    if (!b.emailed_at) {
      const { data: w } = await client.from('waivers').select('*').eq('booking_id', b.id).order('signed_at', { ascending: false }).limit(1).single();
      const whenEn = fmt(b.start_ts, 'en');
      const pdf = await buildWaiverPdf({
        bookingId: b.id, tourName: b.tour_name, dateText: whenEn.date, timeText: whenEn.time, lang,
        lead: { name: b.lead_name, email: b.lead_email, phone: b.lead_phone }, emergency: b.emergency,
        participants: w?.participants ?? [], termsVersion: w?.terms_version ?? '', signedAt: w?.signed_at ?? '', ip: w?.ip ?? '', userAgent: w?.user_agent ?? '',
      });
      const path = `${b.start_ts.slice(0, 10)}/${b.id}.pdf`;
      await client.storage.from('waivers').upload(path, pdf, { contentType: 'application/pdf', upsert: true });
      const filename = `Waiver-${b.start_ts.slice(0, 10)}-${b.lead_name.replace(/[^a-z0-9]+/gi, '-')}.pdf`;
      const attachments = [{ filename, content: toB64(pdf) }];
      const names = (w?.participants ?? []).map((p: { name: string; minor: boolean }) => esc(p.name) + (p.minor ? ' (minor)' : '')).join('<br>');
      const details = (l: 'en' | 'es') => `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${[
        row(l === 'es' ? 'Viaje' : 'Trip', esc(tour ? tour[l].name : b.tour_name)), row(l === 'es' ? 'Fecha' : 'Date', esc(fmt(b.start_ts, l).date)),
        row(l === 'es' ? 'Salida' : 'Departure', esc(fmt(b.start_ts, l).time)), row(l === 'es' ? 'Pasajeros' : 'Passengers', names || String(b.passengers)),
        row(l === 'es' ? 'Total pagado' : 'Total paid', `$${(b.amount_cents / 100).toFixed(2)}`), row(l === 'es' ? 'Reserva' : 'Booking', esc(b.id.slice(0, 8).toUpperCase())),
      ].join('')}</table>`;

      const sentCompany = await sendMail({ to: [company], replyTo: b.lead_email, attachments,
        subject: `New paid booking: ${b.tour_name} · ${whenEn.date} ${whenEn.time} · ${b.lead_name}`,
        html: layout('New paid booking', `${details('en')}<p style="font-size:14px;margin-top:18px"><b>Contact:</b> ${esc(b.lead_name)} · ${esc(b.lead_phone)} · ${esc(b.lead_email)}<br><b>Emergency:</b> ${esc(b.emergency?.name)} · ${esc(b.emergency?.phone)}</p><p style="font-size:13px;color:#6b7b82">The signed Terms & Waiver PDF is attached. It is also on Google Calendar and stored in Supabase (bucket "waivers").</p>`) });
      const sentGuest = await sendMail({ to: [b.lead_email], replyTo: company, attachments,
        subject: lang === 'es' ? `¡Reserva confirmada! ${tourName} · ${when.date}` : `You're booked! ${tourName} · ${when.date}`,
        html: layout(lang === 'es' ? '¡Tu reserva está confirmada!' : 'Your trip is confirmed!', `<p style="font-size:14px">${lang === 'es' ? `Hola ${esc(b.lead_name)}, gracias por reservar con Tours Shaddai.` : `Hi ${esc(b.lead_name)}, thank you for booking with Tours Shaddai.`}</p>${details(lang)}
        <p style="font-size:14px;margin-top:18px">${lang === 'es'
          ? 'Llega 15 minutos antes. Trae bolso pequeño, toalla y protector solar en crema (no aerosol). Solo bebidas en lata. El Capitán Jorge te contactará antes del viaje con el punto de encuentro.'
          : 'Please arrive 15 minutes early. Bring a small bag, a towel and lotion sunscreen (no spray). Canned beverages only. Captain Jorge will contact you before the trip with the meeting point.'}</p>
        <p style="font-size:13px;color:#6b7b82">${lang === 'es' ? 'Adjunto está tu copia de los Términos y el Relevo firmados.' : 'Your copy of the signed Terms & Waiver is attached.'}</p>`) });
      await client.from('bookings').update(sentCompany || sentGuest ? { emailed_at: new Date().toISOString(), waiver_pdf_path: path } : { waiver_pdf_path: path }).eq('id', b.id);
    }
    return new Response('ok');
  } catch (e) {
    console.error(e);
    return new Response('error', { status: 500 }); // Stripe will retry
  }
});
