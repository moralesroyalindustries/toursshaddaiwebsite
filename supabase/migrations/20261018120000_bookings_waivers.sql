/*
  Tours Shaddai: paid bookings + signed waivers.

  - bookings: one row per checkout attempt. Only status = 'paid' blocks the calendar.
    'pending' rows (checkout open) do NOT hold the date; they expire after 30 minutes.
  - An exclusion constraint guarantees two PAID trips can never overlap (one boat, one captain),
    including a 30-minute turnaround buffer. If two people pay for the same slot at the same time,
    the second one fails the constraint and the webhook refunds it automatically.
  - waivers: the signed terms + waiver for each booking (names, signatures, IP, timestamp).
  - RLS is ON with no public policies: only the Edge Functions (service role) can read/write.
*/
create extension if not exists btree_gist;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id text not null,
  tour_name text not null,
  start_ts timestamptz not null,
  end_ts timestamptz not null,
  passengers int not null check (passengers between 1 and 6),
  amount_cents int not null,
  currency text not null default 'usd',
  lang text not null default 'en',
  lead_name text not null,
  lead_email text not null,
  lead_phone text not null,
  emergency jsonb not null,
  status text not null default 'pending' check (status in ('pending','paid','expired','refunded','cancelled')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  calendar_event_id text,
  waiver_pdf_path text,
  emailed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint bookings_time_order check (end_ts > start_ts),
  constraint bookings_no_overlap exclude using gist (
    tstzrange(start_ts - interval '30 minutes', end_ts + interval '30 minutes', '[)') with &&
  ) where (status = 'paid')
);
create index if not exists bookings_status_start_idx on public.bookings (status, start_ts);

create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  terms_version text not null,
  accepted_terms boolean not null,
  accepted_waiver boolean not null,
  participants jsonb not null,   -- [{name, phone, email, minor, guardian, signature (png data url)}]
  signed_at timestamptz not null default now(),
  ip text,
  user_agent text
);
create index if not exists waivers_booking_idx on public.waivers (booking_id);

alter table public.bookings enable row level security;
alter table public.waivers enable row level security;

-- Private bucket for the signed waiver PDFs.
insert into storage.buckets (id, name, public) values ('waivers', 'waivers', false)
on conflict (id) do nothing;
