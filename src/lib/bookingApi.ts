// Talks to the Supabase Edge Functions that hold the secrets (Stripe, Google Calendar, email).
// No secret keys live in the browser. If VITE_SUPABASE_URL is not set, the wizard runs in demo mode.
import { tours, TourId } from '@/data/booking';

const baseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const DEMO_MODE = !baseUrl;

export interface BusyInterval { start: string; end: string } // ISO timestamps
export const BUFFER_MINUTES = 30; // turnaround time between trips (must match the server)
export const PR_OFFSET = '-04:00'; // Puerto Rico is UTC-4 all year (no daylight saving)

export interface Participant {
  name: string;
  phone: string;
  email: string;
  minor: boolean;
  guardian: string;
  signature: string | null; // PNG data URL
}

export interface BookingPayload {
  tourId: TourId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  lang: 'en' | 'es';
  lead: { name: string; email: string; phone: string };
  emergency: { name: string; phone: string; email: string };
  participants: Participant[];
  acceptTerms: boolean;
  acceptWaiver: boolean;
  termsVersion: string;
  returnUrl: string;
}

const headers = () => ({ 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` });

export async function fetchBusy(from: string, to: string): Promise<BusyInterval[]> {
  if (DEMO_MODE) return demoBusy(from, to);
  const res = await fetch(`${baseUrl}/functions/v1/availability?from=${from}&to=${to}`, { headers: headers() });
  if (!res.ok) throw new Error('availability');
  const data = await res.json();
  return data.busy as BusyInterval[];
}

export async function createCheckout(payload: BookingPayload): Promise<{ url: string }> {
  const res = await fetch(`${baseUrl}/functions/v1/create-checkout`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'checkout');
  return data;
}

export function slotRange(date: string, startTime: string, hours: number) {
  const start = new Date(`${date}T${startTime}:00${PR_OFFSET}`);
  const end = new Date(start.getTime() + hours * 3600_000);
  return { start, end };
}

export function isSlotFree(date: string, startTime: string, hours: number, busy: BusyInterval[]) {
  const { start, end } = slotRange(date, startTime, hours);
  const pad = BUFFER_MINUTES * 60_000;
  return !busy.some(b => new Date(b.start).getTime() < end.getTime() + pad && new Date(b.end).getTime() > start.getTime() - pad);
}

export function freeStartTimes(date: string, tourId: TourId, busy: BusyInterval[]) {
  const tour = tours.find(t => t.id === tourId)!;
  return tour.startTimes.filter(time => isSlotFree(date, time, tour.hours, busy));
}

// Demo data so the preview shows a realistic calendar: some days fully booked, some half booked.
function demoBusy(from: string, to: string): BusyInterval[] {
  const out: BusyInterval[] = [];
  const d = new Date(`${from}T12:00:00Z`);
  const last = new Date(`${to}T12:00:00Z`);
  while (d <= last) {
    const iso = d.toISOString().slice(0, 10);
    const n = Number(iso.replace(/-/g, '')) % 7;
    if (n === 0) out.push({ start: `${iso}T07:00:00${PR_OFFSET}`, end: `${iso}T17:00:00${PR_OFFSET}` });
    else if (n === 3) out.push({ start: `${iso}T08:00:00${PR_OFFSET}`, end: `${iso}T12:00:00${PR_OFFSET}` });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}
