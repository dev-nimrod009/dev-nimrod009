/*
# Campus Health Clinic System — core schema

1. New Tables
- `users`: clinic directory (students, triage nurses, doctors, counselors, admin).
  Columns: id (uuid pk), name, email (unique), pin (demo passcode), role
  (STUDENT | TRIAGE_NURSE | DOCTOR | COUNSELOR | ADMIN), student_id (matric no.),
  specialty (for clinicians), bio, created_at.
- `appointments`: booking records. Columns: id, student_id, practitioner_id,
  appointment_date (date), slot_time (text, e.g. "09:30"), category
  (GENERAL_PRACTICE | SEXUAL_HEALTH | COUNSELING), symptoms, status
  (BOOKED | CHECKED_IN | IN_TRIAGE | WAITING_DOCTOR | IN_CONSULTATION |
  COMPLETED | CANCELLED), urgency (ROUTINE | URGENT | EMERGENCY),
  triage_notes (nurse preliminary notes), created_at.
- `medical_records`: electronic health records. Columns: id, student_id, doctor_id,
  appointment_id, diagnosis, prescription, notes, created_at.
- `resources`: clinic + emergency directory. Columns: id, name, contact, category,
  location, description, is_emergency (boolean).
- `chat_messages`: telehealth messages between a student and a clinician.
  Columns: id, sender_id, recipient_id, body, created_at.

2. Security
- RLS enabled on all five tables.
- This app runs in demo mode with no Supabase sign-in: all policies allow the
  anon-key client to read and write (TO anon, authenticated), because the demo
  role-switcher must be usable without a real authenticated session. Any real
  deployment must replace these with authenticated, ownership-scoped policies.

3. Seed data
- Demo users (all pin 1234), clinic resources, and a handful of today's
  appointments in various queue statuses so the triage board is populated.
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  pin text NOT NULL DEFAULT '1234',
  role text NOT NULL CHECK (role IN ('STUDENT','TRIAGE_NURSE','DOCTOR','COUNSELOR','ADMIN')),
  student_id text,
  specialty text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  slot_time text NOT NULL,
  category text NOT NULL CHECK (category IN ('GENERAL_PRACTICE','SEXUAL_HEALTH','COUNSELING')),
  symptoms text,
  status text NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED','CHECKED_IN','IN_TRIAGE','WAITING_DOCTOR','IN_CONSULTATION','COMPLETED','CANCELLED')),
  urgency text NOT NULL DEFAULT 'ROUTINE' CHECK (urgency IN ('ROUTINE','URGENT','EMERGENCY')),
  triage_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis text,
  prescription text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  category text NOT NULL,
  location text,
  description text,
  is_emergency boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_student ON appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_student ON medical_records(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON chat_messages(recipient_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Demo-mode policies: the app has no Supabase auth session (demo role switcher),
-- so the anon-key client must be able to read and write. Replace with
-- authenticated ownership-scoped policies before real deployment.
DROP POLICY IF EXISTS "demo_users_select" ON users;
CREATE POLICY "demo_users_select" ON users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_users_insert" ON users;
CREATE POLICY "demo_users_insert" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_users_update" ON users;
CREATE POLICY "demo_users_update" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_users_delete" ON users;
CREATE POLICY "demo_users_delete" ON users FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_appointments_select" ON appointments;
CREATE POLICY "demo_appointments_select" ON appointments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_appointments_insert" ON appointments;
CREATE POLICY "demo_appointments_insert" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_appointments_update" ON appointments;
CREATE POLICY "demo_appointments_update" ON appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_appointments_delete" ON appointments;
CREATE POLICY "demo_appointments_delete" ON appointments FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_medical_records_select" ON medical_records;
CREATE POLICY "demo_medical_records_select" ON medical_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_medical_records_insert" ON medical_records;
CREATE POLICY "demo_medical_records_insert" ON medical_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_medical_records_update" ON medical_records;
CREATE POLICY "demo_medical_records_update" ON medical_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_medical_records_delete" ON medical_records;
CREATE POLICY "demo_medical_records_delete" ON medical_records FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_resources_select" ON resources;
CREATE POLICY "demo_resources_select" ON resources FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_resources_insert" ON resources;
CREATE POLICY "demo_resources_insert" ON resources FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_resources_update" ON resources;
CREATE POLICY "demo_resources_update" ON resources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_resources_delete" ON resources;
CREATE POLICY "demo_resources_delete" ON resources FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "demo_chat_messages_select" ON chat_messages;
CREATE POLICY "demo_chat_messages_select" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "demo_chat_messages_insert" ON chat_messages;
CREATE POLICY "demo_chat_messages_insert" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "demo_chat_messages_update" ON chat_messages;
CREATE POLICY "demo_chat_messages_update" ON chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "demo_chat_messages_delete" ON chat_messages;
CREATE POLICY "demo_chat_messages_delete" ON chat_messages FOR DELETE TO anon, authenticated USING (true);

-- Seed demo users
INSERT INTO users (name, email, pin, role, student_id, specialty, bio) VALUES
  ('Alex Chen', 'alex@student.campus.edu', '1234', 'STUDENT', 'STU-2024-001', NULL, 'Third-year Biology'),
  ('Maya Okafor', 'maya@student.campus.edu', '1234', 'STUDENT', 'STU-2024-002', NULL, 'Second-year Psychology'),
  ('Liam Rodriguez', 'liam@student.campus.edu', '1234', 'STUDENT', 'STU-2023-118', NULL, 'Fourth-year Engineering'),
  ('Sarah Kim', 'sarah@student.campus.edu', '1234', 'STUDENT', 'STU-2025-044', NULL, 'First-year Pre-Med'),
  ('Grace Ndiritu', 'grace.n@clinic.campus.edu', '1234', 'TRIAGE_NURSE', NULL, 'Triage & Intake', 'RN, 12 years campus clinic experience'),
  ('Dr. Amara Osei', 'a.osei@clinic.campus.edu', '1234', 'DOCTOR', NULL, 'General Practice', 'MD — Family Medicine'),
  ('Dr. Ethan Walsh', 'e.walsh@clinic.campus.edu', '1234', 'DOCTOR', NULL, 'General Practice', 'MD — Internal Medicine'),
  ('Dr. Priya Nair', 'p.nair@clinic.campus.edu', '1234', 'DOCTOR', NULL, 'Sexual Health', 'MD — Sexual & Reproductive Health'),
  ('Dr. Naomi Adeyemi', 'n.adeyemi@clinic.campus.edu', '1234', 'COUNSELOR', NULL, 'Counseling', 'Licensed Clinical Psychologist'),
  ('Sam Okonkwo', 'admin@campus.edu', '1234', 'ADMIN', NULL, 'Administration', 'Clinic Operations Manager')
ON CONFLICT (email) DO NOTHING;

-- Seed clinic + emergency resources
INSERT INTO resources (name, contact, category, location, description, is_emergency) VALUES
  ('Campus Security Emergency', '+1 (555) 010-0911', 'Emergency', 'East Gate Security Office', '24/7 campus security dispatch — fastest response on campus grounds.', true),
  ('Ambulance Dispatch', '911', 'Emergency', '—', 'National emergency medical services. Call for life-threatening emergencies.', true),
  ('Crisis Counseling Line', '+1 (555) 010-0800', 'Mental Health', 'Counseling Center, Union Bldg', 'Confidential 24/7 crisis support for students in distress.', true),
  ('Campus Health Center', '+1 (555) 010-0700', 'Clinic', 'Health Services Bldg, Room 101', 'Front desk — general inquiries, bookings and opening hours.', false),
  ('Sexual Health Clinic', '+1 (555) 010-0755', 'Sexual Health', 'Health Services Bldg, Room 210', 'Confidential STI testing, contraception advice and screening.', false),
  ('Poison Control', '1-800-222-1222', 'Emergency', '—', 'Free, confidential expert advice 24/7 for poisoning emergencies.', true),
  ('Student Wellness Office', '+1 (555) 010-0600', 'Wellness', 'Student Union, Level 2', 'Nutrition, sleep hygiene and wellness programs and workshops.', false)
ON CONFLICT DO NOTHING;

-- Seed today's queue demo appointments (statuses across the pipeline)
INSERT INTO appointments (student_id, practitioner_id, appointment_date, slot_time, category, symptoms, status, urgency, triage_notes)
SELECT s.id, d.id, CURRENT_DATE, v.slot_time, v.category, v.symptoms, v.status, v.urgency, v.triage_notes
FROM (VALUES
  ('alex@student.campus.edu', 'a.osei@clinic.campus.edu', '09:30', 'GENERAL_PRACTICE', 'Persistent headache and mild fever for two days.', 'IN_TRIAGE', 'URGENT', 'Temp 38.1C. No stiff neck. Hydrating in waiting area.'),
  ('maya@student.campus.edu', 'n.adeyemi@clinic.campus.edu', '10:00', 'COUNSELING', 'Feeling overwhelmed with exam stress, trouble sleeping.', 'CHECKED_IN', 'ROUTINE', NULL),
  ('liam@student.campus.edu', 'e.walsh@clinic.campus.edu', '10:30', 'GENERAL_PRACTICE', 'Sprained ankle during intramural football.', 'WAITING_DOCTOR', 'URGENT', 'RICE applied. X-ray not indicated per assessment. Pain 6/10.'),
  ('sarah@student.campus.edu', 'p.nair@clinic.campus.edu', '11:00', 'SEXUAL_HEALTH', 'Requesting routine screening.', 'CHECKED_IN', 'ROUTINE', NULL)
) AS v(student_email, practitioner_email, slot_time, category, symptoms, status, urgency, triage_notes)
JOIN users s ON s.email = v.student_email
JOIN users d ON d.email = v.practitioner_email
WHERE NOT EXISTS (
  SELECT 1 FROM appointments a
  WHERE a.student_id = s.id AND a.appointment_date = CURRENT_DATE AND a.slot_time = v.slot_time
);

INSERT INTO medical_records (student_id, doctor_id, appointment_id, diagnosis, prescription, notes)
SELECT s.id, d.id, NULL, 'Acute pharyngitis (strep negative)', 'Amoxicillin 500mg, 3x daily for 7 days. Paracetamol for pain.', 'Rapid strep test performed. Advised rest and fluids. Follow up in 1 week if no improvement.'
FROM users s, users d
WHERE s.email = 'alex@student.campus.edu' AND d.email = 'a.osei@clinic.campus.edu'
AND NOT EXISTS (SELECT 1 FROM medical_records WHERE student_id = s.id AND doctor_id = d.id);
