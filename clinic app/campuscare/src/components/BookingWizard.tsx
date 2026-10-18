import { useMemo, useState } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, ClipboardList, Loader2, Stethoscope } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { createAppointment, fetchAppointments, todayISO } from '../lib/data';
import { CATEGORY_LABELS } from '../lib/types';
import { SLOT_TIMES } from '../constants';
import type { VisitCategory, User } from '../lib/types';
import { Card, PrivacyNotice } from './ui';

interface Props {
  onNavigate: (view: string) => void;
}

const CATEGORIES: { id: VisitCategory; desc: string }[] = [
  { id: 'GENERAL_PRACTICE', desc: 'Illness, injury, check-ups and referrals.' },
  { id: 'SEXUAL_HEALTH', desc: 'Confidential screening, contraception and advice.' },
  { id: 'COUNSELING', desc: 'Mental health support with licensed counselors.' },
];

const STEPS = ['Visit type', 'Practitioner', 'Date & time', 'Symptoms', 'Confirm'];

export function BookingWizard({ onNavigate }: Props) {
  const { currentUser, users } = useSession();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<VisitCategory | null>(null);
  const [practitioner, setPractitioner] = useState<User | null>(null);
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [takenSlots, setTakenSlots] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const practitioners = useMemo(
    () =>
      users.filter((u) => {
        if (category === 'COUNSELING') return u.role === 'COUNSELOR';
        if (category === 'SEXUAL_HEALTH') return u.role === 'DOCTOR' && u.specialty === 'Sexual Health';
        return u.role === 'DOCTOR' && u.specialty === 'General Practice';
      }),
    [users, category]
  );

  const loadSlots = async (practitionerId: string, dateISO: string) => {
    const appts = await fetchAppointments();
    setTakenSlots((prev) => ({
      ...prev,
      [`${practitionerId}|${dateISO}`]: appts
        .filter(
          (a) =>
            a.practitioner_id === practitionerId &&
            a.appointment_date === dateISO &&
            a.status !== 'CANCELLED'
        )
        .map((a) => a.slot_time),
    }));
  };

  const taken = takenSlots[`${practitioner?.id}|${date}`] ?? [];

  const pickCategory = (c: VisitCategory) => {
    setCategory(c);
    setPractitioner(null);
    setSlot(null);
    setStep(1);
  };

  const pickPractitioner = async (p: User) => {
    setPractitioner(p);
    setSlot(null);
    setStep(2);
    await loadSlots(p.id, date);
  };

  const pickDate = async (d: string) => {
    setDate(d);
    setSlot(null);
    if (practitioner) await loadSlots(practitioner.id, d);
  };

  const confirm = async () => {
    if (!currentUser || !category || !practitioner || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAppointment({
        student_id: currentUser.id,
        practitioner_id: practitioner.id,
        appointment_date: date,
        slot_time: slot,
        category,
        symptoms,
      });
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) return null;

  if (step === 5) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Appointment booked</h1>
        <p className="mt-2 text-sm text-slate-600">
          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {slot} with {practitioner?.name}.
          Check in at the clinic when you arrive to join the queue.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            View dashboard
          </button>
          <button
            onClick={() => { setStep(0); setCategory(null); setPractitioner(null); setSlot(null); setSymptoms(''); }}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Book an appointment</h1>
      <PrivacyNotice />

      {/* Progress */}
      <ol className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-1.5">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i < step ? 'bg-teal-600 text-white' : i === step ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-500' : 'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${i === step ? 'text-teal-700' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Stethoscope className="h-5 w-5 text-teal-600" /> What kind of visit do you need?
            </h2>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.id)}
                className="w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/50"
              >
                <p className="font-semibold text-slate-900">{CATEGORY_LABELS[c.id]}</p>
                <p className="mt-0.5 text-sm text-slate-500">{c.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Choose your practitioner</h2>
            {practitioners.length === 0 && (
              <p className="text-sm text-slate-500">No practitioners available for this visit type right now.</p>
            )}
            {practitioners.map((p) => (
              <button
                key={p.id}
                onClick={() => pickPractitioner(p)}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{p.name}</span>
                  <span className="block text-sm text-slate-500">{p.specialty} · {p.bio}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Calendar className="h-5 w-5 text-teal-600" /> Pick a date and time
            </h2>
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => pickDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <p className="mt-5 text-sm font-medium text-slate-700">Available slots</p>
            {taken.length === 0 && slot === null ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking availability...
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {SLOT_TIMES.map((t) => {
                  const isTaken = taken.includes(t);
                  const slotCls = isTaken
                    ? 'cursor-not-allowed bg-slate-100 text-slate-300 line-through'
                    : slot === t
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50';
                  return (
                    <button
                      key={t}
                      disabled={isTaken}
                      onClick={() => { setSlot(t); setStep(3); }}
                      className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${slotCls}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ClipboardList className="h-5 w-5 text-teal-600" /> Describe your symptoms
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This helps the triage nurse prepare before your visit. Be as specific as you can.
            </p>
            <textarea
              rows={5}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Sore throat and headache for 3 days, worse in the morning..."
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Confirm your booking</h2>
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {[
                ['Visit type', category ? CATEGORY_LABELS[category] : ''],
                ['Practitioner', practitioner?.name ?? ''],
                ['Date', new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })],
                ['Time', slot ?? ''],
                ['Symptoms', symptoms || 'Not provided'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 px-4 py-3">
                  <dt className="w-28 shrink-0 text-sm font-medium text-slate-500">{k}</dt>
                  <dd className="text-sm text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              onClick={confirm}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step === 3 ? (
          <button
            onClick={() => setStep(4)}
            disabled={!symptoms.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-40"
          >
            Review <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
