import { useState, FormEvent } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { ensurePatient } from '../lib/data';
import { Card } from './ui';

interface Props {
  onNavigate: (view: string) => void;
}

export function Login({ onNavigate }: Props) {
  const { setCurrentUser } = useSession();
  const [caseId, setCaseId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await ensurePatient(caseId, pin);
      if (result.error || !result.user) {
        setError(result.error ?? 'Could not open a session.');
      } else {
        setCurrentUser(result.user);
        onNavigate('dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Private access</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open your visit record with your case number and PIN. No name, email or
          personal details are collected.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="caseId">Case number</label>
            <input
              id="caseId"
              type="text"
              required
              value={caseId}
              onChange={(e) => { setCaseId(e.target.value); setError(null); }}
              placeholder="ABC-1234"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              2-4 letters, dash, digits — e.g. STU-2024-001. First time here? Just
              pick any case number you like.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              required
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(null); }}
              placeholder="••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              Any 4+ digit PIN. Use the same case number and PIN next time to see
              this record again.
            </p>
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Opening…' : 'Enter visit record'}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-teal-50/60 px-4 py-3 ring-1 ring-inset ring-teal-100">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <p className="text-xs leading-relaxed text-teal-800">
            Your visit record is only attached to this case number — nothing is
            stored that identifies you. Keep your case number; it is the only key
            to your visit history.
          </p>
        </div>
      </Card>
    </div>
  );
}
