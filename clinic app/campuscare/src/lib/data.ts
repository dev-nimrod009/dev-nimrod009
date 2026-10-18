import { supabase } from './supabase';
import type {
  Appointment,
  AppointmentStatus,
  ChatMessage,
  MedicalRecord,
  Resource,
  Urgency,
  User,
  VisitCategory,
} from './types';

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, student:student_id(*), practitioner:practitioner_id(*)')
    .order('slot_time');
  if (error) throw error;
  return (data ?? []) as unknown as Appointment[];
}

export async function fetchMedicalRecords(): Promise<MedicalRecord[]> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*, student:student_id(*), doctor:doctor_id(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as MedicalRecord[];
}

export async function fetchResources(): Promise<Resource[]> {
  const { data, error } = await supabase.from('resources').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, sender:sender_id(*)')
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as unknown as ChatMessage[];
}

export async function createAppointment(input: {
  student_id: string;
  practitioner_id: string;
  appointment_date: string;
  slot_time: string;
  category: VisitCategory;
  symptoms: string;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...input, status: 'BOOKED', urgency: 'ROUTINE' })
    .select('*, student:student_id(*), practitioner:practitioner_id(*)')
    .single();
  if (error) throw error;
  return data as unknown as Appointment;
}

export async function updateAppointment(
  id: string,
  patch: Partial<Pick<Appointment, 'status' | 'urgency' | 'triage_notes'>>
): Promise<void> {
  const { error } = await supabase.from('appointments').update(patch).eq('id', id);
  if (error) throw error;
}

export async function createMedicalRecord(input: {
  student_id: string;
  doctor_id: string;
  appointment_id: string | null;
  diagnosis: string;
  prescription: string;
  notes: string;
}): Promise<void> {
  const { error } = await supabase.from('medical_records').insert(input);
  if (error) throw error;
}

export async function sendChatMessage(input: {
  sender_id: string;
  recipient_id: string;
  body: string;
}): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert(input);
  if (error) throw error;
}

export async function ensurePatient(caseId: string, pin: string): Promise<{ user?: User; error?: string }> {
  const id = caseId.trim().toUpperCase();
  if (!/^[A-Z]{2,4}-\d{3,6}$/.test(id)) {
    return { error: 'Case numbers look like ABC-1234 (letters, dash, digits).' };
  }
  const { data, error } = await supabase.from('users').select('*').eq('student_id', id).maybeSingle();
  if (error) return { error: 'Could not verify that case number. Please try again.' };
  if (data) {
    if (data.pin !== pin.trim()) return { error: 'Incorrect PIN for this case number.' };
    return { user: data as unknown as User };
  }
  const email = `${id.replace(/[^A-Z0-9]/g, '').toLowerCase()}.access@clinic.campus.health`;
  const { data: created, error: createErr } = await supabase
    .from('users')
    .insert({ name: `Case ${id}`, email, pin: pin.trim(), role: 'STUDENT', student_id: id })
    .select('*')
    .single();
  if (createErr) return { error: 'Could not create a record for that case number.' };
  return { user: created as unknown as User };
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(dateISO: string): boolean {
  return dateISO === todayISO();
}

export const ACTIVE_STATUSES: AppointmentStatus[] = [
  'BOOKED',
  'CHECKED_IN',
  'IN_TRIAGE',
  'WAITING_DOCTOR',
  'IN_CONSULTATION',
];
