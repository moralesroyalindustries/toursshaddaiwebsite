// Google Calendar via a service account (no user login needed).
// Setup: share Captain Jorge's calendar with the service account email ("Make changes to events").
import { Busy, env, TIMEZONE } from './common.ts';

let cached: { token: string; exp: number } | null = null;

const b64url = (data: ArrayBuffer | string) => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = ''; bytes.forEach(b => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const sa = JSON.parse(env('GOOGLE_SERVICE_ACCOUNT_JSON'));
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/calendar', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const pem = String(sa.private_key).replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claim}.${b64url(sig)}` }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google auth failed: ${JSON.stringify(data)}`);
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

const calendarId = () => env('GOOGLE_CALENDAR_ID');
/** Google Calendar is optional: without its secrets, availability uses paid bookings only and no event is created. */
export const googleConfigured = () => !!Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') && !!Deno.env.get('GOOGLE_CALENDAR_ID');

/** Busy blocks on the captain's calendar (any event marked "Busy", including all-day blocks). */
export async function googleBusy(timeMin: string, timeMax: string): Promise<Busy[]> {
  if (!googleConfigured()) return [];
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST', headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin, timeMax, timeZone: TIMEZONE, items: [{ id: calendarId() }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google freeBusy failed: ${JSON.stringify(data)}`);
  const cal = data.calendars?.[calendarId()];
  if (cal?.errors?.length) throw new Error(`Calendar not shared with the service account: ${JSON.stringify(cal.errors)}`);
  return (cal?.busy ?? []) as Busy[];
}

export async function createEvent(e: { summary: string; description: string; start: string; end: string; location?: string }): Promise<string> {
  if (!googleConfigured()) return '';
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events`, {
    method: 'POST', headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: e.summary, description: e.description, location: e.location,
      start: { dateTime: e.start, timeZone: TIMEZONE }, end: { dateTime: e.end, timeZone: TIMEZONE },
      transparency: 'opaque', colorId: '7',
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 24 * 60 }, { method: 'popup', minutes: 120 }] },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google event failed: ${JSON.stringify(data)}`);
  return data.id;
}
