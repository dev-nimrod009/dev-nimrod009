import { ReactNode } from 'react';
import {
  STATUS_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
} from '../constants';
import type { AppointmentStatus, Urgency } from '../lib/types';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
      {icon}
      {children}
    </h2>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    BOOKED: 'bg-slate-100 text-slate-700 ring-slate-200',
    CHECKED_IN: 'bg-sky-50 text-sky-700 ring-sky-200',
    IN_TRIAGE: 'bg-amber-50 text-amber-700 ring-amber-200',
    WAITING_DOCTOR: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    IN_CONSULTATION: 'bg-teal-50 text-teal-700 ring-teal-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${URGENCY_COLORS[urgency]}`}>
      {URGENCY_LABELS[urgency]}
    </span>
  );
}

export function PrivacyNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 text-xs text-sky-800 ${className}`}>
      <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Confidential medical data. Access is logged and restricted to authorized clinic personnel only.</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}
