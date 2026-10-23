// GET /availability?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns only busy time ranges (no names or personal data): paid bookings + the captain's Google Calendar.
import { json, paidBusy, PR_OFFSET, cors } from '../_shared/common.ts';
import { googleBusy } from '../_shared/google.ts';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from') ?? '', to = url.searchParams.get('to') ?? '';
    if (!DAY.test(from) || !DAY.test(to)) return json(req, { error: 'bad_range' }, 400);
    const timeMin = new Date(`${from}T00:00:00${PR_OFFSET}`);
    const timeMax = new Date(new Date(`${to}T00:00:00${PR_OFFSET}`).getTime() + 86_400_000);
    if (timeMax <= timeMin || timeMax.getTime() - timeMin.getTime() > 62 * 86_400_000) return json(req, { error: 'bad_range' }, 400);
    const [g, p] = await Promise.all([googleBusy(timeMin.toISOString(), timeMax.toISOString()), paidBusy(timeMin.toISOString(), timeMax.toISOString())]);
    return json(req, { busy: [...g, ...p] }, 200, { 'Cache-Control': 'public, max-age=30' });
  } catch (e) {
    console.error(e);
    return json(req, { error: 'unavailable' }, 500);
  }
});
