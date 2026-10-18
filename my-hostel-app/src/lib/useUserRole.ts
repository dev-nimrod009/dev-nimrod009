import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type Role = 'landlord' | 'student';

export function useUserRole(userId: string | undefined): { role: Role | null; loading: boolean } {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    let active = true;

    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    async function load() {
      const { data } = await supabase
        .from('landlord_profiles')
        .select('role')
        .eq('id', userId!)
        .maybeSingle();
      if (active) {
        setRole((data?.role as Role) ?? 'student');
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  return { role, loading };
}
