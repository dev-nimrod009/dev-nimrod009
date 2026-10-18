import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Complaint = {
  id: number;
  room_id: number | null;
  title: string;
  description: string;
  status: string;
  response: string | null;
  created_at: string;
  rooms: { number: string } | null;
};

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [rooms, setRooms] = useState<{ id: number; number: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [complaintsRes, roomsRes] = await Promise.all([
        supabase
          .from('complaints')
          .select('id, room_id, title, description, status, response, created_at, rooms(number)')
          .order('created_at', { ascending: false }),
        supabase.from('rooms').select('id, number').order('number'),
      ]);
      if (complaintsRes.error) throw complaintsRes.error;
      if (roomsRes.error) throw roomsRes.error;
      setComplaints((complaintsRes.data ?? []) as unknown as Complaint[]);
      setRooms((roomsRes.data ?? []) as { id: number; number: string }[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from('complaints').insert({
        room_id: roomId ? Number(roomId) : null,
        title: title.trim(),
        description: description.trim(),
      });
      if (error) throw error;
      setSuccess('Problem reported. Management will get back to you.');
      setTitle('');
      setDescription('');
      setRoomId('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to report problem');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Problems</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleReport} className="card space-y-4 p-5">
          <h2 className="font-semibold text-neutral-900">Report a problem</h2>
          <div>
            <label className="label" htmlFor="complaint-room">
              Room
            </label>
            <select
              id="complaint-room"
              className="input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Not room-specific</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="complaint-title">
              Problem
            </label>
            <input
              id="complaint-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Leaking tap"
            />
          </div>
          <div>
            <label className="label" htmlFor="complaint-desc">
              Details
            </label>
            <textarea
              id="complaint-desc"
              className="input min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe what is wrong and where"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-brand-700">{success}</p>}
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Sending…' : 'Report problem'}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          {complaints.length === 0 && (
            <p className="text-neutral-500">You have not reported any problems yet.</p>
          )}
          {complaints.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-neutral-900">{c.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    c.status === 'open'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-brand-100 text-brand-800'
                  }`}
                >
                  {c.status === 'open' ? 'Open' : 'Resolved'}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-2">{c.description}</p>
              <p className="text-xs text-neutral-400">
                {c.rooms ? `Room ${c.rooms.number} · ` : ''}
                {new Date(c.created_at).toLocaleDateString()}
              </p>
              {c.response && (
                <div className="mt-3 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 text-sm text-brand-900">
                  <strong className="font-semibold">Management:</strong> {c.response}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
