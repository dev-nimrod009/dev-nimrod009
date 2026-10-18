import { useEffect, useState } from 'react';
import { CalendarPlus, FileHeart, Loader2, MessageSquare } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { fetchAppointments, fetchMedicalRecords, todayISO } from '../lib/data';
import type { Appointment, MedicalRecord } from '../lib/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../lib/types';
import { Card, EmptyState, ErrorState, PrivacyNotice, Spinner, StatusBadge, UrgencyBadge } from './ui';

interface Props {
  onNavigate: (view: string) => void;
}

export function StudentDashboard({ onNavigate }: Props) {
  const { currentUser } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const [appts, recs] = await Promise.all([
          fetchAppointments(),
          fetchMedicalRecords(),
        ]);
        setAppointments(appts.filter((a) => a.student_id === currentUser.id));
        setRecords(recs.filter((r) => r.student_id === currentUser.id));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (!currentUser) return null;
  if (loading) return <Spinner label="Loading your health records..." />;
  if (error) return <div className="mx-auto max-w-5xl px-4 py-8"><ErrorState message={error} /></div>;

  const upcoming = appointments
    .filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
    .sort((a, b) => (a.appointment_date + a.slot_time).localeCompare(b.appointment_date + b.slot_time));
  const past = appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500">
            {currentUser.student_id} · {currentUser.bio}
          </p>
        </div>
        <button
          onClick={() => onNavigate('book')}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          <CalendarPlus className="h-4 w-4" /> Book appointment
        </button>
      </div>

      <PrivacyNotice />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CalendarPlus className="h-5 w-5 text-teal-600" /> Upcoming visits
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No upcoming appointments. Book one to get started.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })} · {a.slot_time}
                      </p>
                      <p className="text-xs text-slate-500">
                        {CATEGORY_LABELS[a.category]} · {a.practitioner?.name ?? 'Practitioner'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <UrgencyBadge urgency={a.urgency} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                  {a.symptoms && <p className="mt-2 text-sm text-slate-600">{a.symptoms}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FileHeart className="h-5 w-5 text-teal-600" /> My medical history
          </h2>
          {records.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No medical records on file yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {records.map((r) => (
                <li key={r.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{r.diagnosis}</p>
                  {r.prescription && (
                    <p className="mt-1 text-sm text-teal-700">Rx: {r.prescription}</p>
                  )}
                  {r.notes && <p className="mt-1 text-xs text-slate-500">{r.notes}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleDateString()} · {r.doctor?.name ?? 'Clinician'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MessageSquare className="h-5 w-5 text-teal-600" /> Past appointments
        </h2>
        {past.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nothing here yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {past.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString()} · {a.slot_time} · {CATEGORY_LABELS[a.category]}
                  </p>
                  <p className="text-xs text-slate-500">{a.practitioner?.name}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
