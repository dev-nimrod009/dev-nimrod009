import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from './types';

interface AppData {
  users: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppData | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const { data, error: err } = await supabase.from('users').select('*').order('name');
      if (err) throw err;
      setUsers(data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ users, loading, error, refresh }), [users, loading, error]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
