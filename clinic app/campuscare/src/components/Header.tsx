import { useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useSession } from '../lib/SessionContext';
import { ROLE_LABELS } from '../lib/types';
import { CLINIC } from '../constants';

interface Props {
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Header({ onNavigate, currentView }: Props) {
  const { currentUser, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems =
    currentUser?.role === 'STUDENT'
      ? [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'book', label: 'Book Appointment' },
          { id: 'chat', label: 'Messages' },
          { id: 'sos', label: 'Emergency & Resources' },
        ]
      : currentUser?.role === 'TRIAGE_NURSE'
      ? [
          { id: 'queue', label: 'Triage Board' },
          { id: 'chat', label: 'Messages' },
          { id: 'sos', label: 'Emergency & Resources' },
        ]
      : currentUser?.role === 'DOCTOR'
      ? [
          { id: 'consultations', label: 'Consultations' },
          { id: 'chat', label: 'Messages' },
          { id: 'sos', label: 'Emergency & Resources' },
        ]
      : currentUser?.role === 'COUNSELOR'
      ? [
          { id: 'sessions', label: 'Sessions' },
          { id: 'chat', label: 'Messages' },
          { id: 'sos', label: 'Emergency & Resources' },
        ]
      : [
          { id: 'admin', label: 'Admin Console' },
          { id: 'queue', label: 'Queue Overview' },
          { id: 'chat', label: 'Messages' },
          { id: 'sos', label: 'Emergency & Resources' },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-slate-900">{CLINIC.name}</span>
              <span className="block text-[11px] leading-tight text-slate-500">Anonymous Student Health Clinic</span>
            </span>
          </button>

          {currentUser && (
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-slate-900"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50"
                >
                  <span className="hidden font-medium text-slate-700 md:inline">{ROLE_LABELS[currentUser.role]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Private session — no personal details stored</p>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        onNavigate('landing');
                      }}
                      className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Close session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Private access
              </button>
            )}
          </div>
        </div>

        {currentUser && (
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  currentView === item.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
