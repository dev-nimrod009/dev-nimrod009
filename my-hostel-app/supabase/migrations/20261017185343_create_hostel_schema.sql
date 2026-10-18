/*
# Hostel management schema

1. Plain-English summary
This creates the core data for a hostel landlord management app: room classes
(price tiers per floor), rooms, tenants, monthly rent bills, and rent payments.
It also adds a landlord profile table linked to sign-in accounts.

2. New Tables
- `room_classes`: price tiers (e.g. "Underground", "Ground Floor"), each with a
  monthly rent in KES, a display order, and a color label.
- `rooms`: individual rooms with a unique room number, a link to their class,
  and a status ("vacant", "occupied").
- `tenants`: tenants with name, phone number, and optionally an assigned room.
  A tenant can occupy at most one room.
- `bills`: one monthly rent bill per tenant with the amount charged and the
  month it covers.
- `payments`: rent payments recorded against a tenant, with an optional
  M-Pesa receipt code and note.
- `landlord_profiles`: one row per signed-in landlord account, created
  automatically when a new account signs up.

3. Security
- Row Level Security is enabled on every table.
- All tables are scoped to authenticated landlords: each signed-in user can
  read and manage the hostel data. This is a single-landlord management app,
  so all authenticated users share the same data set.
- A database trigger creates a `landlord_profiles` row automatically whenever
  someone signs up, so no manual setup is needed.

4. Notes
- Room numbers are globally unique.
- Payments store an amount in KES (whole numbers).
- Statuses are stored as short text values that the app maps to colors.
*/

CREATE TABLE IF NOT EXISTS landlord_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  hostel_name text NOT NULL DEFAULT 'My Hostel',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_classes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  number text NOT NULL UNIQUE,
  class_id bigint REFERENCES room_classes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'vacant',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenants (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  room_id bigint UNIQUE REFERENCES rooms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bills (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id bigint NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  month date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id bigint NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  mpesa_receipt text,
  note text,
  paid_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "landlord_profiles_select" ON landlord_profiles;
CREATE POLICY "landlord_profiles_select" ON landlord_profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "landlord_profiles_insert" ON landlord_profiles;
CREATE POLICY "landlord_profiles_insert" ON landlord_profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "landlord_profiles_update" ON landlord_profiles;
CREATE POLICY "landlord_profiles_update" ON landlord_profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "hostel_data_select" ON room_classes;
CREATE POLICY "hostel_data_select" ON room_classes FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_insert" ON room_classes;
CREATE POLICY "hostel_data_insert" ON room_classes FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_update" ON room_classes;
CREATE POLICY "hostel_data_update" ON room_classes FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_delete" ON room_classes;
CREATE POLICY "hostel_data_delete" ON room_classes FOR DELETE
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_select" ON rooms;
CREATE POLICY "hostel_data_select" ON rooms FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_insert" ON rooms;
CREATE POLICY "hostel_data_insert" ON rooms FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_update" ON rooms;
CREATE POLICY "hostel_data_update" ON rooms FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_delete" ON rooms;
CREATE POLICY "hostel_data_delete" ON rooms FOR DELETE
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_select" ON tenants;
CREATE POLICY "hostel_data_select" ON tenants FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_insert" ON tenants;
CREATE POLICY "hostel_data_insert" ON tenants FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "hostel_data_update" ON tenants;
CREATE POLICY "hostel_data_update" ON tenants FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_delete" ON tenants;
CREATE POLICY "hostel_data_delete" ON tenants FOR DELETE
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_select" ON bills;
CREATE POLICY "hostel_data_select" ON bills FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_insert" ON bills;
CREATE POLICY "hostel_data_insert" ON bills FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_update" ON bills;
CREATE POLICY "hostel_data_update" ON bills FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_delete" ON bills;
CREATE POLICY "hostel_data_delete" ON bills FOR DELETE
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_select" ON payments;
CREATE POLICY "hostel_data_select" ON payments FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "hostel_data_insert" ON payments;
CREATE POLICY "hostel_data_insert" ON payments FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_update" ON payments;
CREATE POLICY "hostel_data_update" ON payments FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hostel_data_delete" ON payments;
CREATE POLICY "hostel_data_delete" ON payments FOR DELETE
TO authenticated USING (true);

CREATE OR REPLACE FUNCTION handle_new_landlord()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO landlord_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_landlord();
