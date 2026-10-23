// POST /create-checkout
// Validates the booking + signed waiver, checks the slot is still free, saves both, and opens Stripe Checkout.
// The slot is NOT held while the customer pays; only a completed payment books it (see stripe-webhook).
import { allowedOrigins, cors, db, json, overlaps, paidBusy, PR_OFFSET } from '../_shared/common.ts';
import { googleBusy } from '../_shared/google.ts';
import { stripe } from '../_shared/stripe.ts';
import { MAX_PASSENGERS, tours } from '../_shared/booking-texts.ts';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.method !== 'POST') return json(req, { error: 'method' }, 405);
  try {
    const b = await req.json();
    const tour = tours.find(t => t.id === b.tourId);
    if (!tour || !DAY.test(b.date) || !tour.startTimes.includes(b.startTime)) return json(req, { error: 'invalid_tour' }, 400);

    const lead = { name: str(b.lead?.name), email: str(b.lead?.email).toLowerCase(), phone: str(b.lead?.phone, 40) };
    const emergency = { name: str(b.emergency?.name), phone: str(b.emergency?.phone, 40), email: str(b.emergency?.email) };
    if (lead.name.length < 2 || !EMAIL.test(lead.email) || lead.phone.replace(/\D/g, '').length < 7) return json(req, { error: 'invalid_contact' }, 400);
    if (emergency.name.length < 2 || emergency.phone.replace(/\D/g, '').length < 7) return json(req, { error: 'invalid_emergency' }, 400);
    if (b.acceptTerms !== true || b.acceptWaiver !== true) return json(req, { error: 'waiver_required' }, 400);

    const raw = Array.isArray(b.participants) ? b.participants : [];
    if (raw.length < 1 || raw.length > MAX_PASSENGERS) return json(req, { error: 'invalid_passengers' }, 400);
    const participants = raw.map((p: Record<string, unknown>) => ({
      name: str(p.name), phone: str(p.phone, 40), email: str(p.email), minor: p.minor === true, guardian: str(p.guardian),
      signature: typeof p.signature === 'string' && p.signature.startsWith('data:image/png;base64,') && p.signature.length < 400_000 ? p.signature : '',
    }));
    if (participants.some((p: { name: string; minor: boolean; guardian: string; signature: string }) => p.name.length < 2 || !p.signature || (p.minor && p.guardian.length < 2)))
      return json(req, { error: 'signatures_required' }, 400);

    const start = new Date(`${b.date}T${b.startTime}:00${PR_OFFSET}`);
    const end = new Date(start.getTime() + tour.hours * 3_600_000);
    if (start.getTime() < Date.now() + 6 * 3_600_000) return json(req, { error: 'too_soon' }, 400);

    // One boat: any paid trip or calendar event overlapping this window blocks it.
    const dayMin = new Date(start.getTime() - 86_400_000).toISOString(), dayMax = new Date(end.getTime() + 86_400_000).toISOString();
    const [g, p] = await Promise.all([googleBusy(dayMin, dayMax), paidBusy(dayMin, dayMax)]);
    if (overlaps(start, end, [...g, ...p])) return json(req, { error: 'slot_taken' }, 409);

    const lang = b.lang === 'es' ? 'es' : 'en';
    const client = db();
    const { data: booking, error } = await client.from('bookings').insert({
      tour_id: tour.id, tour_name: tour.en.name, start_ts: start.toISOString(), end_ts: end.toISOString(),
      passengers: participants.length, amount_cents: tour.price * 100, lang,
      lead_name: lead.name, lead_email: lead.email, lead_phone: lead.phone, emergency,
    }).select('id').single();
    if (error) throw error;

    const { error: wErr } = await client.from('waivers').insert({
      booking_id: booking.id, terms_version: str(b.termsVersion, 40) || 'unknown', accepted_terms: true, accepted_waiver: true, participants,
      ip: (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim(), user_agent: str(req.headers.get('user-agent'), 300),
    });
    if (wErr) throw wErr;

    // Only redirect back to our own site.
    const origins = allowedOrigins();
    const ret = str(b.returnUrl, 300);
    const base = origins.some(o => ret.startsWith(o)) ? ret : origins[0];
    const sep = base.includes('?') ? '&' : '?';
    const dateText = start.toLocaleDateString('en-US', { timeZone: 'America/Puerto_Rico', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const timeText = start.toLocaleTimeString('en-US', { timeZone: 'America/Puerto_Rico', hour: 'numeric', minute: '2-digit' });

    const session = await stripe('checkout/sessions', {
      mode: 'payment',
      locale: lang,
      customer_email: lead.email,
      client_reference_id: booking.id,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${base}${sep}booking=success&session_id={CHECKOUT_SESSION_ID}#book`,
      cancel_url: `${base}${sep}booking=cancelled#book`,
      line_items: { 0: { quantity: 1, price_data: { currency: 'usd', unit_amount: tour.price * 100, product_data: {
        name: `Tours Shaddai · ${tour[lang].name}`,
        description: `${dateText} · ${timeText} · ${participants.length} ${lang === 'es' ? 'pasajero(s)' : 'passenger(s)'} · Private boat`,
      } } } },
      metadata: { booking_id: booking.id, tour_id: tour.id, start: start.toISOString() },
      payment_intent_data: { metadata: { booking_id: booking.id }, description: `Tours Shaddai ${tour.en.name} ${dateText}` },
    }, 'POST', `checkout-${booking.id}`);

    await client.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);
    return json(req, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(req, { error: 'server' }, 500);
  }
});
