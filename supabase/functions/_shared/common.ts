import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

export const BUFFER_MINUTES = 30; // same as src/lib/bookingApi.ts and the SQL exclusion constraint
export const PR_OFFSET = '-04:00'; // Puerto Rico: UTC-4 all year
export const TIMEZONE = 'America/Puerto_Rico';

export const env = (name: string, required = true) => {
  const v = Deno.env.get(name) ?? '';
  if (required && !v) throw new Error(`Missing secret ${name}`);
  return v;
};

export const db = () => createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

export const allowedOrigins = () => env('SITE_URL').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);

export function cors(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  const list = allowedOrigins();
  const allow = list.includes(origin) || origin.startsWith('http://localhost') ? origin : list[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

export const json = (req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json', ...extra } });

export interface Busy { start: string; end: string }

export function overlaps(aStart: Date, aEnd: Date, busy: Busy[]) {
  const pad = BUFFER_MINUTES * 60_000;
  return busy.some(b => new Date(b.start).getTime() < aEnd.getTime() + pad && new Date(b.end).getTime() > aStart.getTime() - pad);
}

/** Paid bookings in a window, optionally excluding one booking id. */
export async function paidBusy(timeMin: string, timeMax: string, excludeId?: string): Promise<Busy[]> {
  let q = db().from('bookings').select('id,start_ts,end_ts').eq('status', 'paid').lt('start_ts', timeMax).gt('end_ts', timeMin);
  if (excludeId) q = q.neq('id', excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(r => ({ start: r.start_ts, end: r.end_ts }));
}
