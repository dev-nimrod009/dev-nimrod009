import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, UserPlus, RefreshCw, KeyRound, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/SessionContext';
import type { Role, User } from '../lib/types';
import { ROLE_LABELS } from '../lib/types';
import { Card, ErrorState, Spinner } from './ui';

const ROLES: Role[] = ['STUDENT', 'TRIAGE_NURSE', 'DOCTOR', 'COUNSELOR', 'ADMIN'];

interface Draft {
  name: string;
  email: string;
  role: Role;
  specialty: string;
  bio: string;
  pin: string;
}

const emptyDraft: Draft = { name: '', email: '', role: 'DOCTOR', specialty: '', bio: '', pin: '1234' };

export function AdminConsole() {
  const { currentUser } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [pinFor, setPinFor] = useState<User | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('role')
        .order('name');
      if (err) throw err;
      setUsers(data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: Record<string, unknown>, message: string) => {
    setError(null);
    setNotice(null);
    try {
      const { error: err } = await supabase.from('users').update(patch).eq('id', id);
      if (err) throw err;
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      setNotice(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const savePin = async () => {
    if (!pinFor) return;
    const pin = pinValue.trim();
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    await update(pinFor.id, { pin }, `PIN updated for ${pinFor.name}.`);
    setPinFor(null);
    setPinValue('');
  };

  const addStaff = async () => {
    const name = draft.name.trim();
    const email = draft.email.trim().toLowerCase();
    const pin = draft.pin.trim();
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('users').insert({
        name,
        email,
        role: draft.role,
        pin,
        specialty: draft.specialty.trim() || null,
        bio: draft.bio.trim() || null,
      });
      if (err) throw err;
      setShowAdd(false);
      setDraft(emptyDraft);
      setNotice(`${name} added as ${ROLE_LABELS[draft.role]}.`);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add staff member.';
      setError(msg.includes('duplicate') ? 'An account with that email already exists.' : msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.specialty ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.is_active !== false).length,
      clinicians: users.filter((u) => ['DOCTOR', 'COUNSELOR', 'TRIAGE_NURSE'].includes(u.role)).length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
    }),
    [users]
  );

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Restricted area</h1>
        <p className="mt-2 text-sm text-slate-500">
          The Admin Console is only available to accounts with the Admin role.
        </p>
      </div>
    );
  }

  if (loading) return <Spinner label="Loading directory..." />;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-teal-600" /> Admin Console
          </h1>
          <p className="text-sm text-slate-500">Manage roles, accounts and access codes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAdd((s) => !s); setError(null); setNotice(null); }}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <UserPlus className="h-4 w-4" /> Add staff
          </button>
          <button
            onClick={() => { setLoading(true); load(); }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} />}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {showAdd && (
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900">New staff member</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Full name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="Dr. Jane Doe"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="j.doe@clinic.campus.edu"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Role</span>
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Specialty (optional)</span>
              <input
                value={draft.specialty}
                onChange={(e) => setDraft({ ...draft, specialty: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="General Practice"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Access code (PIN)</span>
              <input
                value={draft.pin}
                onChange={(e) => setDraft({ ...draft, pin: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="1234"
              />
            </label>
            <label className="block text-sm sm:col-span-2 lg:col-span-3">
              <span className="font-medium text-slate-700">Short bio (optional)</span>
              <input
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                placeholder="MD — Family Medicine"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => { setShowAdd(false); setDraft(emptyDraft); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={addStaff}
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add staff member'}
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total accounts', value: stats.total },
          { label: 'Active accounts', value: stats.active },
          { label: 'Clinicians', value: stats.clinicians },
          { label: 'Admins', value: stats.admins },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="Search by name, email or specialty..."
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(['ALL', ...ROLES] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  roleFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className={u.is_active === false ? 'bg-slate-50/60 text-slate-400' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    {u.specialty && <p className="text-xs text-slate-500">{u.specialty}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === currentUser.id}
                      onChange={(e) => update(u.id, { role: e.target.value }, `${u.name} is now ${ROLE_LABELS[e.target.value as Role]}.`)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      title={u.id === currentUser.id ? 'You cannot change your own role' : undefined}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={u.id === currentUser.id}
                      onClick={() =>
                        update(
                          u.id,
                          { is_active: u.is_active === false },
                          u.is_active === false ? `${u.name} reactivated.` : `${u.name} deactivated.`
                        )
                      }
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset disabled:cursor-not-allowed disabled:opacity-60 ${
                        u.is_active === false
                          ? 'bg-slate-100 text-slate-500 ring-slate-200'
                          : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      }`}
                      title={u.id === currentUser.id ? 'You cannot deactivate your own account' : undefined}
                    >
                      {u.is_active === false ? 'Inactive' : 'Active'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => { setPinFor(u); setPinValue(''); setError(null); setNotice(null); }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                        title="Reset access code"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> PIN
                      </button>
                      <button
                        disabled={u.id === currentUser.id}
                        onClick={() => {
                          if (!window.confirm(`Remove ${u.name} permanently? This cannot be undone.`)) return;
                          setError(null);
                          supabase
                            .from('users')
                            .delete()
                            .eq('id', u.id)
                            .then(({ error: err }) => {
                              if (err) {
                                setError(err.message.includes('foreign key')
                                  ? `${u.name} has appointments or records linked. Deactivate instead.`
                                  : 'Could not delete account.');
                              } else {
                                setUsers((prev) => prev.filter((p) => p.id !== u.id));
                                setNotice(`${u.name} removed.`);
                              }
                            });
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title={u.id === currentUser.id ? 'You cannot remove your own account' : 'Remove account'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    No accounts match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {pinFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900">Reset access code</h3>
            <p className="mt-1 text-xs text-slate-500">
              Set a new 4-6 digit code for {pinFor.name}. They will use it together with their email to sign in.
            </p>
            <input
              autoFocus
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-widest focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="••••"
              inputMode="numeric"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPinFor(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={savePin}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Save code
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
