import { useEffect, useState } from 'react';
import { fetchTenants, fetchVacantRooms, createTenant, deleteTenant, type TenantWithFinance } from '../lib/data';
import type { Room } from '../lib/supabase';

export default function Tenants() {
  const [tenants, setTenants] = useState<TenantWithFinance[]>([]);
  const [vacantRooms, setVacantRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomId, setRoomId] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [t, rooms] = await Promise.all([fetchTenants(), fetchVacantRooms()]);
      setTenants(t);
      setVacantRooms(rooms);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createTenant({
        name: name.trim(),
        phone_number: phone.trim(),
        room_id: roomId ? Number(roomId) : null,
      });
      setName('');
      setPhone('');
      setRoomId('');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add tenant');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tenant: TenantWithFinance) {
    if (!confirm(`Remove ${tenant.name}? Their bills and payments stay on record.`)) return;
    setError(null);
    try {
      await deleteTenant(tenant.id, tenant.room_id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove tenant');
    }
  }

  if (loading) return <p className="text-neutral-500">Loading tenants…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Tenants</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add tenant'}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="card mb-6 grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="tenant-name">
              Full name
            </label>
            <input
              id="tenant-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Wanjiku"
            />
          </div>
          <div>
            <label className="label" htmlFor="tenant-phone">
              Phone number
            </label>
            <input
              id="tenant-phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="2547XXXXXXXX"
              pattern="2547[0-9]{8}"
              title="Phone in format 2547XXXXXXXX"
            />
          </div>
          <div>
            <label className="label" htmlFor="tenant-room">
              Assign room (optional)
            </label>
            <select
              id="tenant-room"
              className="input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">No room yet</option>
              {vacantRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number} — {r.room_classes?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save tenant'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Room</th>
              <th className="px-5 py-3 font-medium">Billed</th>
              <th className="px-5 py-3 font-medium">Paid</th>
              <th className="px-5 py-3 font-medium">Balance</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-3 font-medium text-neutral-900">{t.name}</td>
                <td className="px-5 py-3 text-neutral-500">{t.phone_number}</td>
                <td className="px-5 py-3 text-neutral-700">{t.rooms?.number ?? '—'}</td>
                <td className="px-5 py-3 text-neutral-700">KES {t.billed.toLocaleString()}</td>
                <td className="px-5 py-3 text-brand-700">KES {t.paid.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span
                    className={`font-semibold ${
                      t.balance > 0 ? 'text-red-600' : t.balance < 0 ? 'text-brand-600' : 'text-neutral-500'
                    }`}
                  >
                    KES {t.balance.toLocaleString()}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(t)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-neutral-500">
                  No tenants yet. Add your first tenant above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
