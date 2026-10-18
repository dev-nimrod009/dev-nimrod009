import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Booking = {
  id: number;
  user_id: string;
  room_id: number;
  student_name: string;
  phone_number: string;
  status: string;
  created_at: string;
  rooms: { number: string; room_classes: { name: string; price: number } | null } | null;
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  async function load() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, user_id, room_id, student_name, phone_number, status, created_at, rooms(number, room_classes(name, price))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBookings((data ?? []) as unknown as Booking[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(booking: Booking, decision: 'approved' | 'rejected') {
    setBusyId(booking.id);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: decision })
        .eq('id', booking.id);
      if (error) throw error;

      if (decision === 'approved') {
        // Attach the student as a tenant and mark the room occupied.
        const { error: tenantErr } = await supabase.from('tenants').insert({
          name: booking.student_name,
          phone_number: booking.phone_number,
          room_id: booking.room_id,
        });
        if (tenantErr) throw tenantErr;
        const { error: roomErr } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', booking.room_id);
        if (roomErr) throw roomErr;
        setSuccess(`Approved ${booking.student_name} for room ${booking.rooms?.number}.`);
      } else {
        setSuccess(`Rejected ${booking.student_name}'s request for room ${booking.rooms?.number}.`);
      }
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Action failed';
      setError(
        message.includes('duplicate')
          ? 'This student already has a tenant record. Approve the booking only once.'
          : message,
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading bookings…</p>;

  const visible = bookings.filter((b) => filter === 'all' || b.status === filter);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
          <p className="text-sm text-neutral-500">
            {pendingCount > 0
              ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} waiting for your decision`
              : 'No pending requests'}
          </p>
        </div>
        <select
          className="input w-44"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 text-sm text-brand-800">
          {success}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-neutral-500">No {filter === 'all' ? '' : filter + ' '}bookings.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h3 className="font-semibold text-neutral-900">{b.student_name}</h3>
                <p className="text-sm text-neutral-500">
                  Room <strong>{b.rooms?.number ?? '—'}</strong> · {b.rooms?.room_classes?.name ?? ''}{' '}
                  · {b.phone_number}
                </p>
                <p className="text-xs text-neutral-400">
                  Requested {new Date(b.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {b.status === 'pending' ? (
                  <>
                    <button
                      className="btn-primary"
                      disabled={busyId === b.id}
                      onClick={() => decide(b, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-danger"
                      disabled={busyId === b.id}
                      onClick={() => decide(b, 'rejected')}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      b.status === 'approved'
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {b.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
