# Tours Shaddai — Online booking setup

How it works: the customer picks a trip, sees live availability, enters passengers, accepts the Terms, and signs the waiver (one signature per passenger, parent/guardian for minors). Then they pay with Stripe Checkout.
- **Before payment:** the date is not held.
- **After payment:** the booking is confirmed, added to Google Calendar, and the signed waiver PDF is emailed to the company and to the customer.
- **One boat:** any paid trip or calendar event blocks every package that overlaps it, with 30 minutes of turnaround between trips. If two people pay for the same slot at the same moment, the second payment is refunded automatically.

## 1. Supabase (backend)
1. Create a Supabase project (or use the existing Tours Shaddai one).
2. Run `supabase/migrations/20261018120000_bookings_waivers.sql`. Paste it in **SQL Editor → Run**, or use `supabase db push`.
3. Deploy the 3 functions with the CLI, from this folder:
   ```
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy availability --no-verify-jwt
   supabase functions deploy create-checkout --no-verify-jwt
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
4. Add the secrets under **Project Settings → Edge Functions → Secrets** (you enter these yourself):

   | Name | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | Tours Shaddai Stripe **secret** key (`sk_live_…`), or a restricted key with Checkout Sessions + Refunds write access |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 2 below |
   | `GOOGLE_SERVICE_ACCOUNT_JSON` | The full JSON key file from step 3 below |
   | `GOOGLE_CALENDAR_ID` | The captain's calendar ID (often his Gmail address) |
   | `RESEND_API_KEY` | API key from resend.com |
   | `RESEND_FROM` | e.g. `Tours Shaddai <reservas@yourdomain.com>` (the domain must be verified in Resend) |
   | `COMPANY_EMAIL` | `boattoursshaddai@gmail.com` |
   | `SITE_URL` | The live site URL, e.g. `https://toursshaddai.com`. Separate several with commas. |

## 2. Stripe webhook
1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Set the URL to `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`.
3. Select the events `checkout.session.completed` and `checkout.session.expired`.
4. Copy the **Signing secret** (`whsec_…`) into the `STRIPE_WEBHOOK_SECRET` secret.

## 3. Google Calendar (service account)
1. Go to console.cloud.google.com, create a project, and enable the **Google Calendar API**.
2. Go to **IAM & Admin → Service Accounts → Create**. Open the account, then **Keys → Add key → JSON** to download the file.
3. In Google Calendar on Jorge's account, open the calendar's **Settings and sharing → Share with specific people**. Add the service account email (`…@….iam.gserviceaccount.com`) with **Make changes to events**.
4. On the same page, copy the **Calendar ID** into `GOOGLE_CALENDAR_ID`.

To block a day or time (maintenance, a private trip, a day off), create a normal **Busy** event in that calendar. The website hides those times right away.

> Turn off or stop sharing the Google *appointment schedule* links. Those let people book without paying or signing.

## 4. Website (Netlify)
Under **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the publishable key), then redeploy. Without them, the booking calendar runs in demo mode.

## Where things are stored
- **Supabase → Table editor → `bookings`:** every booking with its status (pending / paid / expired / refunded).
- **Supabase → Table editor → `waivers`:** the signed data, with IP address and timestamp.
- **Supabase → Storage → `waivers`:** the PDF files.
- **Google Calendar:** a ⛵ event for each paid trip.
- **Email:** the company and the customer each get the PDF.

## Before going live
- Captain Jorge should review the draft Terms in `src/data/booking.ts`, especially the cancellation and refund policy. Then copy the file to `supabase/functions/_shared/booking-texts.ts`; both files must match.
- Have a lawyer confirm the waiver and electronic signature meet Puerto Rico requirements.
- Run one real booking with a small test price, then refund it from Stripe.
- Roll (regenerate) any webhook secret that was shared in chat.
