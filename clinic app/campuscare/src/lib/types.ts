export type Role = 'STUDENT' | 'TRIAGE_NURSE' | 'DOCTOR' | 'COUNSELOR' | 'ADMIN';

export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'IN_TRIAGE'
  | 'WAITING_DOCTOR'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED';

export type Urgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export type VisitCategory = 'GENERAL_PRACTICE' | 'SEXUAL_HEALTH' | 'COUNSELING';

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: Role;
  student_id: string | null;
  specialty: string | null;
  bio: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  student_id: string;
  practitioner_id: string;
  appointment_date: string;
  slot_time: string;
  category: VisitCategory;
  symptoms: string | null;
  status: AppointmentStatus;
  urgency: Urgency;
  triage_notes: string | null;
  created_at: string;
  student?: User;
  practitioner?: User;
}

export interface MedicalRecord {
  id: string;
  student_id: string;
  doctor_id: string;
  appointment_id: string | null;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  created_at: string;
  student?: User;
  doctor?: User;
}

export interface Resource {
  id: string;
  name: string;
  contact: string;
  category: string;
  location: string | null;
  description: string | null;
  is_emergency: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  sender?: User;
}

export const CATEGORY_LABELS: Record<VisitCategory, string> = {
  GENERAL_PRACTICE: 'General Practice',
  SEXUAL_HEALTH: 'Sexual Health',
  COUNSELING: 'Counseling',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  BOOKED: 'Booked',
  CHECKED_IN: 'Checked In',
  IN_TRIAGE: 'In Triage',
  WAITING_DOCTOR: 'Waiting for Doctor',
  IN_CONSULTATION: 'In Consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  ROUTINE: 'Routine',
  URGENT: 'Urgent',
  EMERGENCY: 'Emergency',
};

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  TRIAGE_NURSE: 'Triage Nurse',
  DOCTOR: 'Doctor',
  COUNSELOR: 'Counselor',
  ADMIN: 'Admin',
};
