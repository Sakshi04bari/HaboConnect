/*
# Create HaboTech LSA booking schema

1. New Tables
- `parents`: parent profiles who request learning support.
- `lsas`: Learning Support Assistants, including skill tags and hourly rate.
- `bookings`: requested or confirmed sessions linking one parent to one LSA.
- `payments`: payment gateway events and payment state for a booking.

2. Relationships and indexes
- Bookings reference parents and LSAs.
- Payments reference bookings.
- Indexes support availability searches by skill, date, and booking status.
- A range exclusion constraint prevents overlapping sessions for the same LSA.

3. Security
- RLS is enabled on every table.
- This prototype is intentionally single-tenant and has no sign-in screen, so anon and authenticated roles can use the shared demo data.
- Four explicit CRUD policies are added per table.

4. Important notes
- Booking state changes are represented by `status` and `payment_status`.
- Webhook identifiers are unique for safe event replay.
*/

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lsas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  hourly_rate numeric(10, 2) NOT NULL DEFAULT 45,
  timezone text NOT NULL DEFAULT 'UTC',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE RESTRICT,
  lsa_id uuid NOT NULL REFERENCES lsas(id) ON DELETE RESTRICT,
  child_name text NOT NULL,
  skill text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CONSTRAINT bookings_lsa_no_overlap EXCLUDE USING gist (
    lsa_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'mock_gateway',
  provider_event_id text UNIQUE,
  amount numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lsas_active_skills ON lsas USING gin (skills) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_lsa_start ON bookings (lsa_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status_start ON bookings (status, starts_at);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_parents" ON parents;
CREATE POLICY "anon_select_parents" ON parents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_parents" ON parents;
CREATE POLICY "anon_insert_parents" ON parents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_parents" ON parents;
CREATE POLICY "anon_update_parents" ON parents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_parents" ON parents;
CREATE POLICY "anon_delete_parents" ON parents FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_lsas" ON lsas;
CREATE POLICY "anon_select_lsas" ON lsas FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lsas" ON lsas;
CREATE POLICY "anon_insert_lsas" ON lsas FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lsas" ON lsas;
CREATE POLICY "anon_update_lsas" ON lsas FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lsas" ON lsas;
CREATE POLICY "anon_delete_lsas" ON lsas FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);
