import { Activity, Clock, Phone, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { CLINIC } from '../constants';
import { Card } from './ui';

interface Props {
  onNavigate: (view: string) => void;
}

export function Landing({ onNavigate }: Props) {
  const { currentUser } = useSession();

  return (
    <div>
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/25">
              <ShieldCheck className="h-4 w-4" /> Confidential · Secure · Student-first
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
              Your campus health, <span className="text-teal-100">one tap away.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-teal-50 sm:text-lg">
              Book same-day appointments with campus doctors and counselors, join the live
              clinic queue, consult securely online, and reach emergency help instantly —
              all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-700 shadow-md transition hover:bg-teal-50"
              >
                {currentUser ? 'Go to my dashboard' : 'Sign in to get started'}
              </button>
              <button
                onClick={() => onNavigate('sos')}
                className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700"
              >
                Emergency SOS
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-teal-50">
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Hotline: {CLINIC.phone}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Mon–Fri 8AM–6PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Stethoscope, title: 'Book a Doctor', text: 'General practice, sexual health and counseling visits with live slot availability.' },
            { icon: Users, title: 'Digital Queue', text: 'See your real-time place in the waiting room — no more guessing.' },
            { icon: ShieldCheck, title: 'Private Records', text: 'Your electronic health records stay confidential and access-logged.' },
            { icon: Activity, title: 'Telehealth Chat', text: 'Remote check-ins with clinicians for follow-ups and quick questions.' },
          ].map((f) => (
            <Card key={f.title} className="p-6 transition hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Clock className="h-5 w-5 text-teal-600" /> Operating Hours
            </h3>
            <ul className="mt-4 space-y-2">
              {CLINIC.hours.map((h) => (
                <li key={h.day} className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
                  <span className="font-medium text-slate-700">{h.day}</span>
                  <span className="text-slate-500">{h.time}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-rose-200 bg-rose-50/50 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Phone className="h-5 w-5 text-rose-600" /> Emergency Hotlines
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-4">
                <span className="font-medium text-slate-700">Campus Security (24/7)</span>
                <a href="tel:+15550100911" className="font-semibold text-rose-600">+1 (555) 010-0911</a>
              </li>
              <li className="flex justify-between gap-4">
                <span className="font-medium text-slate-700">Ambulance Dispatch</span>
                <a href="tel:911" className="font-semibold text-rose-600">911</a>
              </li>
              <li className="flex justify-between gap-4">
                <span className="font-medium text-slate-700">Crisis Counseling Line</span>
                <a href="tel:+15550100800" className="font-semibold text-rose-600">+1 (555) 010-0800</a>
              </li>
            </ul>
            <button
              onClick={() => onNavigate('sos')}
              className="mt-5 w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Open Emergency Hub
            </button>
          </Card>
        </div>
      </section>
    </div>
  );
}
