import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useUserRole } from './lib/useUserRole';
import type { Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import StudentHome from './pages/StudentHome';
import StudentComplaints from './pages/StudentComplaints';
import StudentPayments from './pages/StudentPayments';
import Bookings from './pages/Bookings';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  const { role, loading: roleLoading } = useUserRole(userId);

  if (loading || (session && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-500">Loading…</div>
      </div>
    );
  }

  const isStudent = role === 'student';
  const Shell = isStudent ? StudentLayout : Layout;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          element={session ? <Shell /> : <Navigate to="/login" replace />}
        >
          {isStudent ? (
            <>
              <Route path="/" element={<StudentHome />} />
              <Route path="/my-complaints" element={<StudentComplaints />} />
              <Route path="/my-payments" element={<StudentPayments />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}
        </Route>
        {/* Unknown addresses fall back home; each dashboard only shows its own routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
