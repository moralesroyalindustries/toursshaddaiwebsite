/*
# Create booking_requests table (single-tenant, no auth)

1. New Tables
- `booking_requests`
  - `id` (uuid, primary key)
  - `name` (text, not null) — full name of the person requesting
  - `phone` (text, not null) — contact phone number
  - `email` (text, not null) — contact email
  - `destination` (text, not null) — preferred destination (Cayo Icacos, Palomino, or Not Sure Yet)
  - `preferred_date` (date, nullable) — optional preferred date
  - `guests` (integer, nullable) — optional number of guests
  - `message` (text, nullable) — optional message from the guest
  - `status` (text, default 'pending') — request status: pending, confirmed, declined
  - `created_at` (timestamptz, default now()) — when the request was submitted
2. Security
- Enable RLS on `booking_requests`.
- Allow anon + authenticated INSERT only (public can submit requests).
- No SELECT, UPDATE, or DELETE for anon (only the owner/admin would manage these later).
3. Important Notes
- This is a no-auth public website. Visitors submit availability requests without signing in.
- Only INSERT is allowed for anon to prevent public access to other people's booking data.
- The business owner can view and manage requests directly in the Supabase dashboard.
*/

CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  destination text NOT NULL,
  preferred_date date,
  guests integer,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_booking_requests" ON booking_requests;
CREATE POLICY "anon_insert_booking_requests" ON booking_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON booking_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests (status);
