import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAppData } from './AppContext';
import type { User } from './types';

interface SessionData {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  setCurrentUser: (u: User) => void;
  logout: () => void;
  login: (email: string, pin: string) => string | null;
}

const SessionContext = createContext<SessionData | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { users, loading } = useAppData();
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('clinic-demo-user');
    if (savedId && users.length > 0) {
      const found = users.find((u) => u.id === savedId);
      if (found) setCurrentUserState(found);
    }
  }, [users]);

  const setCurrentUser = (u: User) => {
    setCurrentUserState(u);
    localStorage.setItem('clinic-demo-user', u.id);
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('clinic-demo-user');
  };

  const login = (email: string, pin: string): string | null => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return 'No account found with that email.';
    if (user.is_active === false) return 'This account has been deactivated. Contact a clinic admin.';
    if (user.pin !== pin.trim()) return 'Incorrect PIN. Demo PIN is 1234.';
    setCurrentUser(user);
    return null;
  };

  const value = useMemo(
    () => ({ currentUser, users, loading, setCurrentUser, logout, login }),
    [currentUser, users, loading]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionData {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
