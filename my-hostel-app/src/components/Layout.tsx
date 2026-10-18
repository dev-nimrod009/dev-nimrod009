import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/rooms', label: 'Rooms' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/payments', label: 'Payments' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              MH
            </div>
            <span className="font-semibold text-neutral-900">My Hostel</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button onClick={signOut} className="btn-secondary ml-2">
              Sign out
            </button>
          </nav>

          <button
            className="btn-secondary md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-600 hover:bg-neutral-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button onClick={signOut} className="btn-secondary mt-2">
                Sign out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
