import { useCallback, useEffect, useState } from 'react';
import { FileHeart, Pill, Save, Stethoscope } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import {
  fetchAppointments,
  fetchMedicalRecords,
  todayISO,
  updateAppointment,
  createMedicalRecord,
} from '../lib/data';
import type { Appointment, MedicalRecord } from '../lib/types';
import { CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../lib/types';
import { Card, EmptyState, ErrorState, PrivacyNotice, Spinner, UrgencyBadge } from './ui';

export function ConsultationView({ counselorMode = false }: { counselorMode?: boolean }) {
  const { currentUser } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [appts, recs] = await Promise.all([fetchAppointments(), fetchMedicalRecords()]);
      const mine = appts.filter(
        (a) =>
          a.appointment_date === todayISO() &&
          a.practitioner_id === currentUser.id &&
          (counselorMode
            ? ['WAITING_DOCTOR', 'IN_CONSULTATION'].includes(a.status)
            : ['WAITING_DOCTOR', 'IN_CONSULTATION', 'COMPLETED'].includes(a.status))
      );
      setAppointments(mine);
      setRecords(recs.filter((r) => mine.some((a) => a.student_id === r.student_id)));
      setSelected((prev) => (prev ? mine.find((a) => a.id === prev.id) ?? mine[0] ?? null : mine[0] ?? null));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, counselorMode]);

  useEffect(() => {
    load();
  }, [load]);

  const patientRecords = selected ? records.filter((r) => r.student_id === selected.student_id) : [];

  const startConsultation = async (a: Appointment) => {
    setSelected(a);
    setDiagnosis('');
    setPrescription('');
    setNotes('');
    setSaved(false);
    if (a.status === 'WAITING_DOCTOR') {
      try {
        await updateAppointment(a.id, { status: 'IN_CONSULTATION' });
        load();
      } catch {
        /* board will refresh */
      }
    }
  };

  const saveRecord = async () => {
    if (!selected || !currentUser) return;
    setSaving(true);
    try {
      await createMedicalRecord({
        student_id: selected.student_id,
        doctor_id: currentUser.id,
        appointment_id: selected.id,
        diagnosis,
        prescription,
        notes,
      });
      await updateAppointment(selected.id, { status: 'COMPLETED' });
      setSaved(true);
      setDiagnosis('');
      setPrescription('');
      setNotes('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;
  if (loading) return <Spinner label="Loading consultations..." />;

  const active = appointments.filter((a) => a.status !== 'COMPLETED');
  const doneToday = appointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          {counselorMode ? 'Therapy Sessions' : 'Consultations'} — Today
        </h1>
        <p className="text-sm text-slate-500">Dr. {currentUser.name.replace(/^Dr\.?\s*/i, '')} · {currentUser.specialty}</p>
      </div>

      <PrivacyNotice />
      {error && <ErrorState message={error} />}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Patient list */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Patient queue ({active.length})</h2>
          {active.length === 0 && doneToday.length === 0 && (
            <EmptyState message="No patients in your queue today." />
          )}
          {[...active, ...doneToday].map((a) => (
            <button
              key={a.id}
              onClick={() => startConsultation(a)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected?.id === a.id
                  ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-300'
                  : 'border-slate-200 bg-white hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{a.student?.name}</p>
                  <p className="text-xs text-slate-500">
                    {a.slot_time} · {CATEGORY_LABELS[a.category]}{a.student?.student_id ? ` · ${a.student.student_id}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <UrgencyBadge urgency={a.urgency} />
                  <span className={`text-[11px] font-medium ${a.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
              </div>
              {a.symptoms && <p className="mt-2 line-clamp-2 text-xs text-slate-600">{a.symptoms}</p>}
              {a.triage_notes && (
                <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Triage: {a.triage_notes}</p>
              )}
            </button>
          ))}
        </div>

        {/* Consultation panel */}
        <div className="space-y-6 lg:col-span-3">
          {!selected ? (
            <EmptyState message="Select a patient from the queue to begin." />
          ) : (
            <>
              <Card className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <FileHeart className="h-5 w-5 text-teal-600" /> Patient history — {selected.student?.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.student?.student_id ?? 'Staff visitor'} · presenting: {selected.symptoms ?? 'not provided'}
                </p>
                {patientRecords.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No prior records on file. First visit.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {patientRecords.map((r) => (
                      <li key={r.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{r.diagnosis}</p>
                          <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        {r.prescription && <p className="mt-1 flex items-center gap-1 text-teal-700"><Pill className="h-3.5 w-3.5" /> {r.prescription}</p>}
                        {r.notes && <p className="mt-1 text-xs text-slate-500">{r.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {selected.status !== 'COMPLETED' && (
                <Card className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Save className="h-5 w-5 text-teal-600" /> {counselorMode ? 'Therapy log' : 'Clinical notes & prescription'}
                  </h2>
                  {saved && (
                    <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      Record saved. Visit marked complete.
                    </p>
                  )}
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">{counselorMode ? 'Session summary / therapy log' : 'Diagnosis'}</label>
                      <input
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder={counselorMode ? 'e.g. GAD-7 score 12, CBT techniques introduced' : 'e.g. Acute pharyngitis'}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">{counselorMode ? 'Recommended plan / referral' : 'Digital prescription'}</label>
                      <textarea
                        rows={2}
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder={counselorMode ? 'Weekly sessions, sleep hygiene plan, wellness referral...' : 'Medication, dosage, frequency, duration...'}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Clinical notes</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observations, tests performed, follow-up advice..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                    <button
                      onClick={saveRecord}
                      disabled={saving || !diagnosis.trim()}
                      className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving record...' : 'Save record & complete visit'}
                    </button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
