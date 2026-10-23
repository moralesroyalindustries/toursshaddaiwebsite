import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, Lock, ShieldCheck, Users, XCircle } from 'lucide-react';
import { MAX_PASSENGERS, terms, tours, TourId, waiverClosing, waiverFull, waiverFullIntro, waiverSummary } from '@/data/booking';
import { BusyInterval, createCheckout, DEMO_MODE, fetchBusy, freeStartTimes, Participant } from '@/lib/bookingApi';
import SignaturePad from './SignaturePad';

type Lang = 'en' | 'es';
export const TERMS_VERSION = '2026-10-v1';

const L = {
  en: {
    steps: ['Tour', 'Date', 'Guests', 'Waiver', 'Pay'],
    chooseTour: 'Choose your trip', perBoat: 'whole boat · up to 6', hours: 'hours',
    chooseDate: 'Pick a date', chooseTime: 'Departure time', available: 'Available', limited: 'Limited', full: 'Booked', loading: 'Checking availability…', noTimes: 'No departures left on this day. Please pick another date.', availError: 'We could not load availability. Please try again or contact us on WhatsApp.',
    holdNote: 'Seeing a date as available does not hold it. Your date is reserved only once payment is completed.',
    guestsTitle: 'Who is coming?', count: 'Number of passengers', lead: 'Main contact (booking name)', name: 'Full name', email: 'Email', phone: 'Phone',
    emergency: 'Emergency contact (not on the boat)', passengers: 'Passengers', passenger: 'Passenger', minor: 'Under 18', guardian: 'Parent / guardian full name', optional: 'optional',
    waiverTitle: 'Terms & waiver', waiverIntro: 'Please read the terms and the release. Every passenger signs below. A parent or guardian signs for minors.',
    termsHead: 'Terms & conditions', summaryHead: 'Waiver & release (summary)', fullHead: 'Voluntary release, waiver and assumption of risk', legalLang: '',
    acceptTerms: 'I accept the Terms & Conditions.', acceptWaiver: 'I have read the Waiver & Release and the full Release, and I agree to them on behalf of every passenger listed.',
    signHere: 'Sign here with your finger or mouse', clear: 'Clear', signAs: 'Signature of', signFor: 'signing for minor',
    reviewTitle: 'Review & pay', tour: 'Trip', date: 'Date', time: 'Departure', guests: 'Passengers', total: 'Total', signed: 'Waiver signed by all passengers',
    pay: 'Pay & reserve', paying: 'Opening secure checkout…', secure: 'Secure payment by Stripe. Your date is held only after payment is complete.',
    back: 'Back', next: 'Continue', required: 'Please complete the highlighted fields.',
    demo: 'Preview mode: payments are not active yet. In the live site this button opens Stripe Checkout.',
    successTitle: 'You are booked!', successText: 'Payment received. A confirmation and a copy of your signed waiver are on the way to your email. Captain Jorge will contact you before the trip.',
    cancelTitle: 'Payment not completed', cancelText: 'No charge was made and the date was not reserved. You can try again whenever you are ready.', again: 'Book again',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'], days: ['Su','Mo','Tu','We','Th','Fr','Sa'],
  },
  es: {
    steps: ['Tour', 'Fecha', 'Pasajeros', 'Relevo', 'Pago'],
    chooseTour: 'Escoge tu viaje', perBoat: 'bote completo · hasta 6', hours: 'horas',
    chooseDate: 'Escoge una fecha', chooseTime: 'Hora de salida', available: 'Disponible', limited: 'Limitado', full: 'Reservado', loading: 'Verificando disponibilidad…', noTimes: 'No quedan salidas este día. Escoge otra fecha.', availError: 'No pudimos cargar la disponibilidad. Intenta otra vez o escríbenos por WhatsApp.',
    holdNote: 'Ver una fecha disponible no la reserva. Tu fecha queda reservada solo cuando se completa el pago.',
    guestsTitle: '¿Quiénes vienen?', count: 'Número de pasajeros', lead: 'Contacto principal (nombre de la reserva)', name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono',
    emergency: 'Contacto de emergencia (que no esté en el bote)', passengers: 'Pasajeros', passenger: 'Pasajero', minor: 'Menor de 18', guardian: 'Nombre completo del padre, madre o tutor', optional: 'opcional',
    waiverTitle: 'Términos y relevo', waiverIntro: 'Lee los términos y el relevo. Cada pasajero firma abajo. El padre, madre o tutor firma por los menores.',
    termsHead: 'Términos y condiciones', summaryHead: 'Relevo de responsabilidad (resumen)', fullHead: 'Relevo voluntario y asunción de riesgo', legalLang: 'El documento legal oficial está en inglés.',
    acceptTerms: 'Acepto los Términos y Condiciones.', acceptWaiver: 'Leí el Relevo (resumen) y el Relevo completo, y los acepto en nombre de todos los pasajeros.',
    signHere: 'Firma aquí con tu dedo o el ratón', clear: 'Borrar', signAs: 'Firma de', signFor: 'firma por el menor',
    reviewTitle: 'Revisa y paga', tour: 'Viaje', date: 'Fecha', time: 'Salida', guests: 'Pasajeros', total: 'Total', signed: 'Relevo firmado por todos los pasajeros',
    pay: 'Pagar y reservar', paying: 'Abriendo pago seguro…', secure: 'Pago seguro con Stripe. Tu fecha se reserva solo cuando el pago se completa.',
    back: 'Atrás', next: 'Continuar', required: 'Completa los campos marcados.',
    demo: 'Modo vista previa: los pagos aún no están activos. En el sitio real este botón abre Stripe Checkout.',
    successTitle: '¡Reserva confirmada!', successText: 'Recibimos tu pago. La confirmación y una copia de tu relevo firmado van camino a tu correo. El Capitán Jorge te contactará antes del viaje.',
    cancelTitle: 'Pago no completado', cancelText: 'No se hizo ningún cargo y la fecha no se reservó. Puedes intentarlo otra vez cuando quieras.', again: 'Reservar otra vez',
    months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'], days: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
  },
};

const emptyP = (): Participant => ({ name: '', phone: '', email: '', minor: false, guardian: '', signature: null });
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = (t: string, lang: Lang) => { const [h, m] = t.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString(lang === 'es' ? 'es-PR' : 'en-US', { hour: 'numeric', minute: '2-digit' }); };
const fmtDate = (d: string, lang: Lang) => new Date(`${d}T12:00:00`).toLocaleDateString(lang === 'es' ? 'es-PR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const MAX_DAYS_AHEAD = 365;

export default function BookingWizard({ lang, preselect }: { lang: Lang; preselect?: TourId | null }) {
  const t = L[lang];
  const [step, setStep] = useState(0);
  const [tourId, setTourId] = useState<TourId | null>(preselect ?? null);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [busyError, setBusyError] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [count, setCount] = useState(2);
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [emergency, setEmergency] = useState({ name: '', phone: '', email: '' });
  const [people, setPeople] = useState<Participant[]>([emptyP(), emptyP()]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptWaiver, setAcceptWaiver] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [demoNote, setDemoNote] = useState(false);
  const [result, setResult] = useState<'success' | 'cancelled' | null>(null);

  const tour = tours.find(x => x.id === tourId) ?? null;

  useEffect(() => { if (preselect) { setTourId(preselect); setStep(s => (s === 0 ? 1 : s)); } }, [preselect]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('booking');
    if (p === 'success' || p === 'cancelled') {
      setResult(p);
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      setTimeout(() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, []);

  // Load busy times for the visible month (+ a few days margin).
  useEffect(() => {
    if (step !== 1) return;
    const from = iso(new Date(month.getFullYear(), month.getMonth(), 1));
    const to = iso(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    let alive = true;
    setLoadingBusy(true); setBusyError(false);
    fetchBusy(from, to).then(b => { if (alive) setBusy(b); }).catch(() => { if (alive) setBusyError(true); }).finally(() => { if (alive) setLoadingBusy(false); });
    return () => { alive = false; };
  }, [month, step]);

  useEffect(() => {
    setPeople(prev => {
      const next = prev.slice(0, count);
      while (next.length < count) next.push(emptyP());
      return next;
    });
  }, [count]);

  // Passenger 1 follows the main contact's name until someone types a different name there.
  const prevLead = useRef('');
  useEffect(() => {
    const before = prevLead.current, now = lead.name;
    prevLead.current = now;
    setPeople(prev => prev.map((p, i) => (i === 0 && p.name === before ? { ...p, name: now } : p)));
  }, [lead.name]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDate = new Date(today); minDate.setDate(minDate.getDate() + 1); // book at least one day ahead
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);

  const calendar = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: ({ day: number; key: string; state: 'past' | 'free' | 'limited' | 'full' } | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysIn; d++) {
      const dt = new Date(month.getFullYear(), month.getMonth(), d);
      const key = iso(dt);
      if (dt < minDate || dt > maxDate || !tour) { cells.push({ day: d, key, state: 'past' }); continue; }
      const free = freeStartTimes(key, tour.id, busy).length;
      cells.push({ day: d, key, state: free === 0 ? 'full' : free < tour.startTimes.length ? 'limited' : 'free' });
    }
    return cells;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, busy, tour]);

  const timesForDate = date && tour ? tour.startTimes.map(s => ({ s, free: freeStartTimes(date, tour.id, busy).includes(s) })) : [];

  const guestsValid = lead.name.trim().length > 1 && emailOk(lead.email) && lead.phone.replace(/\D/g, '').length >= 7
    && emergency.name.trim().length > 1 && emergency.phone.replace(/\D/g, '').length >= 7
    && people.every(p => p.name.trim().length > 1 && (!p.minor || p.guardian.trim().length > 1) && (!p.email || emailOk(p.email)));
  const waiverValid = acceptTerms && acceptWaiver && people.every(p => !!p.signature);

  const canNext = [!!tour, !!date && !!time, guestsValid, waiverValid, true][step];
  const go = (n: number) => { setShowErrors(false); setStep(n); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const next = () => { if (!canNext) { setShowErrors(true); return; } go(step + 1); };
  const upd = (i: number, patch: Partial<Participant>) => setPeople(prev => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const err = (bad: boolean) => (showErrors && bad ? ' bk-invalid' : '');

  const pay = async () => {
    if (!tour || !date || !time) return;
    setPayError('');
    if (DEMO_MODE) { setDemoNote(true); return; }
    setPaying(true);
    try {
      const { url } = await createCheckout({
        tourId: tour.id, date, startTime: time, lang, lead, emergency, participants: people,
        acceptTerms, acceptWaiver, termsVersion: TERMS_VERSION,
        returnUrl: window.location.origin + window.location.pathname,
      });
      window.location.href = url;
    } catch (e) {
      const code = (e as Error).message;
      setPayError(code === 'slot_taken'
        ? (lang === 'es' ? 'Esa salida se acaba de reservar. Escoge otra hora o fecha.' : 'That departure was just booked. Please pick another time or date.')
        : (lang === 'es' ? 'No pudimos abrir el pago. Intenta otra vez o escríbenos por WhatsApp.' : 'We could not open checkout. Please try again or message us on WhatsApp.'));
      setPaying(false);
      if (code === 'slot_taken') { setTime(null); go(1); }
    }
  };

  const reset = () => { setResult(null); setStep(0); setTourId(null); setDate(null); setTime(null); setAcceptTerms(false); setAcceptWaiver(false); setPeople(people.map(p => ({ ...p, signature: null }))); };

  if (result) return <div className="bk-card bk-result" id="book">
    {result === 'success' ? <CheckCircle2 size={46} className="bk-ok" /> : <XCircle size={46} className="bk-warn" />}
    <h3>{result === 'success' ? t.successTitle : t.cancelTitle}</h3>
    <p>{result === 'success' ? t.successText : t.cancelText}</p>
    <button className="button button-gold" onClick={reset}>{t.again}</button>
  </div>;

  return <div className="bk-card" id="book">
    <ol className="bk-steps">{t.steps.map((s, i) => <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}><span>{i < step ? <Check size={12} /> : i + 1}</span>{s}</li>)}</ol>

    {step === 0 && <div className="bk-body">
      <h3>{t.chooseTour}</h3>
      <div className="bk-tours">{tours.map(x => <button type="button" key={x.id} className={`bk-tour${tourId === x.id ? ' on' : ''}`} onClick={() => { setTourId(x.id); setDate(null); setTime(null); }}>
        <span className="bk-tour-name">{x[lang].name}</span>
        <span className="bk-tour-short">{x[lang].short}</span>
        <span className="bk-tour-meta"><Clock size={13} /> {x.hours} {t.hours} · <Users size={13} /> {t.perBoat}</span>
        <strong>${x.price.toLocaleString()}</strong>
      </button>)}</div>
    </div>}

    {step === 1 && tour && <div className="bk-body">
      <h3>{t.chooseDate}</h3>
      <div className="bk-cal">
        <div className="bk-cal-head">
          <button type="button" aria-label="Previous month" disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
          <strong>{t.months[month.getMonth()]} {month.getFullYear()}</strong>
          <button type="button" aria-label="Next month" disabled={month >= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
        </div>
        <div className="bk-cal-grid">
          {t.days.map(d => <span key={d} className="bk-dow">{d}</span>)}
          {calendar.map((c, i) => c === null ? <span key={`e${i}`} /> :
            <button type="button" key={c.key} disabled={loadingBusy || busyError || c.state === 'past' || c.state === 'full'} className={`bk-day ${c.state}${date === c.key ? ' on' : ''}`} onClick={() => { setDate(c.key); setTime(null); }}>{c.day}</button>)}
        </div>
        <div className="bk-legend"><span><i className="free" />{t.available}</span><span><i className="limited" />{t.limited}</span><span><i className="full" />{t.full}</span></div>
        {loadingBusy && <div className="bk-loading"><Loader2 size={16} className="spin" /> {t.loading}</div>}
        {busyError && <p className="bk-error">{t.availError}</p>}
      </div>
      {date && <div className="bk-times">
        <h4><CalendarDays size={15} /> {fmtDate(date, lang)}</h4>
        <span className="bk-label">{t.chooseTime}</span>
        <div className="bk-time-list">{timesForDate.map(({ s, free }) => <button type="button" key={s} disabled={!free} className={`bk-time${time === s ? ' on' : ''}`} onClick={() => setTime(s)}>{fmtTime(s, lang)}{!free && <small>{t.full}</small>}</button>)}</div>
        {timesForDate.every(x => !x.free) && <p className="bk-error">{t.noTimes}</p>}
      </div>}
      <p className="bk-note"><Lock size={13} /> {t.holdNote}</p>
    </div>}

    {step === 2 && <div className="bk-body">
      <h3>{t.guestsTitle}</h3>
      <label className="bk-label">{t.count}</label>
      <div className="bk-count">{Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map(n => <button type="button" key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>{n}</button>)}</div>

      <fieldset className="bk-fs"><legend>{t.lead}</legend>
        <div className="bk-row3">
          <input className={`bk-in${err(lead.name.trim().length < 2)}`} placeholder={t.name} value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} autoComplete="name" />
          <input className={`bk-in${err(!emailOk(lead.email))}`} placeholder={t.email} type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} autoComplete="email" />
          <input className={`bk-in${err(lead.phone.replace(/\D/g, '').length < 7)}`} placeholder={t.phone} type="tel" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} autoComplete="tel" />
        </div>
      </fieldset>

      <fieldset className="bk-fs"><legend>{t.emergency}</legend>
        <div className="bk-row3">
          <input className={`bk-in${err(emergency.name.trim().length < 2)}`} placeholder={t.name} value={emergency.name} onChange={e => setEmergency({ ...emergency, name: e.target.value })} />
          <input className={`bk-in${err(emergency.phone.replace(/\D/g, '').length < 7)}`} placeholder={t.phone} type="tel" value={emergency.phone} onChange={e => setEmergency({ ...emergency, phone: e.target.value })} />
          <input className={`bk-in${err(!!emergency.email && !emailOk(emergency.email))}`} placeholder={`${t.email} (${t.optional})`} type="email" value={emergency.email} onChange={e => setEmergency({ ...emergency, email: e.target.value })} />
        </div>
      </fieldset>

      <fieldset className="bk-fs"><legend>{t.passengers}</legend>
        {people.map((p, i) => <div className="bk-pax" key={i}>
          <span className="bk-pax-n">{t.passenger} {i + 1}</span>
          <div className="bk-row3">
            <input className={`bk-in${err(p.name.trim().length < 2)}`} placeholder={t.name} value={p.name} onChange={e => upd(i, { name: e.target.value })} />
            <input className="bk-in" placeholder={`${t.phone} (${t.optional})`} type="tel" value={p.phone} onChange={e => upd(i, { phone: e.target.value })} />
            <input className={`bk-in${err(!!p.email && !emailOk(p.email))}`} placeholder={`${t.email} (${t.optional})`} type="email" value={p.email} onChange={e => upd(i, { email: e.target.value })} />
          </div>
          <label className="bk-check small"><input type="checkbox" checked={p.minor} onChange={e => upd(i, { minor: e.target.checked, signature: null })} /> {t.minor}</label>
          {p.minor && <input className={`bk-in${err(p.guardian.trim().length < 2)}`} placeholder={t.guardian} value={p.guardian} onChange={e => upd(i, { guardian: e.target.value, signature: null })} />}
        </div>)}
      </fieldset>
      {showErrors && !guestsValid && <p className="bk-error">{t.required}</p>}
    </div>}

    {step === 3 && <div className="bk-body">
      <h3>{t.waiverTitle}</h3>
      <p className="bk-sub">{t.waiverIntro}</p>
      <div className="bk-doc" tabIndex={0}>
        <h4>{t.termsHead}</h4>
        <ol>{terms[lang].map(x => <li key={x}>{x}</li>)}</ol>
        <h4>{t.summaryHead}</h4>
        {t.legalLang && <p className="bk-lang">{t.legalLang}</p>}
        <p className="bk-small">Excursion date: {date && fmtDate(date, 'en')} · {tour?.en.name}</p>
        <ol>{waiverSummary.map(x => <li key={x}>{x}</li>)}</ol>
        <h4>{t.fullHead}</h4>
        <p>{waiverFullIntro}</p>
        <ol>{waiverFull.map(x => <li key={x}>{x}</li>)}</ol>
        <p><strong>{waiverClosing}</strong></p>
      </div>
      <label className={`bk-check${err(!acceptTerms)}`}><input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} /> {t.acceptTerms}</label>
      <label className={`bk-check${err(!acceptWaiver)}`}><input type="checkbox" checked={acceptWaiver} onChange={e => setAcceptWaiver(e.target.checked)} /> {t.acceptWaiver}</label>
      <div className="bk-sigs">{people.map((p, i) => <div className={`bk-sig${err(!p.signature)}`} key={i}>
        <span className="bk-label">{t.signAs} {p.minor ? <>{p.guardian || '—'} <em>({t.signFor} {p.name})</em></> : p.name}</span>
        <SignaturePad value={p.signature} onChange={sig => upd(i, { signature: sig })} clearLabel={t.clear} placeholder={t.signHere} />
      </div>)}</div>
      {showErrors && !waiverValid && <p className="bk-error">{t.required}</p>}
    </div>}

    {step === 4 && tour && date && time && <div className="bk-body">
      <h3>{t.reviewTitle}</h3>
      <dl className="bk-review">
        <div><dt>{t.tour}</dt><dd>{tour[lang].name}</dd></div>
        <div><dt>{t.date}</dt><dd>{fmtDate(date, lang)}</dd></div>
        <div><dt>{t.time}</dt><dd>{fmtTime(time, lang)}</dd></div>
        <div><dt>{t.guests}</dt><dd>{people.map(p => p.name).join(', ')}</dd></div>
        <div className="bk-total"><dt>{t.total}</dt><dd>${tour.price.toLocaleString()}.00</dd></div>
      </dl>
      <p className="bk-signed"><ShieldCheck size={16} /> {t.signed}</p>
      <button type="button" className="button button-gold bk-pay" onClick={pay} disabled={paying}>{paying ? <><Loader2 size={17} className="spin" /> {t.paying}</> : <><Lock size={16} /> {t.pay} · ${tour.price.toLocaleString()}</>}</button>
      <p className="bk-note">{t.secure}</p>
      {payError && <p className="bk-error">{payError}</p>}
      {demoNote && <p className="bk-demo">{t.demo}</p>}
    </div>}

    <div className="bk-nav">
      {step > 0 ? <button type="button" className="bk-back" onClick={() => go(step - 1)}><ArrowLeft size={16} /> {t.back}</button> : <span />}
      {step < 4 && <button type="button" className={`button button-gold bk-next${canNext ? '' : ' dim'}`} onClick={next}>{t.next} <ArrowRight size={16} /></button>}
    </div>
  </div>;
}
