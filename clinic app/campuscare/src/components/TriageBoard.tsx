import { useCallback, useEffect, useState } from 'react';
import { ClipboardEdit, MonitorDot, RefreshCw } from 'lucide-react';
import { fetchAppointments, todayISO, updateAppointment, ACTIVE_STATUSES } from '../lib/data';
import type { Appointment, AppointmentStatus, Urgency } from '../lib/types';
import { CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../lib/types';
import { Card, EmptyState, ErrorState, Spinner, StatusBadge, UrgencyBadge } from './ui';

const COLUMNS: { status: AppointmentStatus; hint: string }[] = [
  { status: 'CHECKED_IN', hint: 'Arrived at clinic' },
  { status: 'IN_TRIAGE', hint: 'With nurse' },
  { status: 'WAITING_DOCTOR', hint: 'Ready for doctor' },
  { status: 'IN_CONSULTATION', hint: 'With doctor now' },
];

export function TriageBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<Appointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAppointments();
      setAppointments(data.filter((a) => a.appointment_date === todayISO()));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const move = async (a: Appointment, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status } : x)));
    try {
      await updateAppointment(a.id, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
      load();
    }
  };

  const setUrgency = async (a: Appointment, urgency: Urgency) => {
    setAppointments((prev) => prev.map((x) => (x.id === a.id ? { ...x, urgency } : x)));
    try {
      await updateAppointment(a.id, { urgency });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
      load();
    }
  };

  const saveNotes = async () => {
    if (!notesFor) return;
    setSaving(true);
    try {
      await updateAppointment(notesFor.id, { triage_notes: notesText, status: 'WAITING_DOCTOR' });
      setNotesFor(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading clinic queue..." />;

  const booked = appointments.filter((a) => a.status === 'BOOKED');
  const completed = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <MonitorDot className="h-6 w-6 text-teal-600" /> Triage Board — Live Queue
          </h1>
          <p className="text-sm text-slate-500">Today · auto-refreshes every 15 seconds</p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {booked.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60 p-4">
          <p className="text-sm font-semibold text-amber-800">
            {booked.length} incoming booking{booked.length > 1 ? 's' : ''} awaiting check-in review
          </p>
          <ul className="mt-3 space-y-2">
            {booked.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-amber-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {a.student?.name} · {a.slot_time} · {CATEGORY_LABELS[a.category]}
                  </p>
                  <p className="text-xs text-slate-500">{a.symptoms}</p>
                </div>
                <button
                  onClick={() => move(a, 'CHECKED_IN')}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Check in
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = appointments.filter((a) => a.status === col.status);
          return (
            <Card key={col.status} className="flex flex-col bg-slate-50/80 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{STATUS_LABELS[col.status]}</h2>
                  <p className="text-xs text-slate-500">{col.hint}</p>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {items.length}
                </span>
              </div>
              <div className="mt-3 flex-1 space-y-3">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">Empty</p>
                )}
                {items
                  .sort((a, b) => {
                    const order = { EMERGENCY: 0, URGENT: 1, ROUTINE: 2 };
                    return order[a.urgency] - order[b.urgency] || a.slot_time.localeCompare(b.slot_time);
                  })
                  .map((a) => (
                    <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{a.student?.name}</p>
                          <p className="text-xs text-slate-500">{a.slot_time} · {CATEGORY_LABELS[a.category]}</p>
                        </div>
                        <UrgencyBadge urgency={a.urgency} />
                      </div>
                      {a.symptoms && <p className="mt-2 line-clamp-2 text-xs text-slate-600">{a.symptoms}</p>}
                      {a.triage_notes && (
                        <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Nurse: {a.triage_notes}</p>
                      )}
                      <div className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {COLUMNS.map((c) =>
                            c.status !== a.status ? (
                              <button
                                key={c.status}
                                onClick={() => move(a, c.status)}
                                className="rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                              >
                                → {STATUS_LABELS[c.status]}
                              </button>
                            ) : null
                          )}
                          {a.status !== 'COMPLETED' && (
                            <button
                              onClick={() => move(a, 'COMPLETED')}
                              className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              → Completed
                            </button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {(Object.keys(URGENCY_LABELS) as Urgency[]).map((u) => (
                            <button
                              key={u}
                              onClick={() => setUrgency(a, u)}
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                a.urgency === u ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {URGENCY_LABELS[u]}
                            </button>
                          ))}
                          <button
                            onClick={() => { setNotesFor(a); setNotesText(a.triage_notes ?? ''); }}
                            className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-teal-700 hover:bg-teal-50"
                          >
                            <ClipboardEdit className="h-3 w-3" /> Notes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          );
        })}
      </div>

      {completed.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900">Completed today ({completed.length})</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {completed.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{a.student?.name} · {a.slot_time} · {CATEGORY_LABELS[a.category]}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {notesFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900">Triage notes — {notesFor.student?.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Preliminary observations. Saving will move this student to "Waiting for Doctor".
            </p>
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="Vitals, observations, immediate actions..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setNotesFor(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={saveNotes}
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save & queue for doctor'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {appointments.length === 0 && <EmptyState message="No appointments in today's queue yet." />}
    </div>
  );
}
