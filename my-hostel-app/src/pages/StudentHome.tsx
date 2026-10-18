import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Room } from '../lib/supabase';

type Booking = {
  id: number;
  room_id: number;
  student_name: string;
  status: string;
  rooms: { number: string; room_classes: { name: string; price: number } | null } | null;
};

export default function StudentHome() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        supabase
          .from('rooms')
          .select('id, number, status, room_classes(id, name, price, sort_order), tenants(id)')
          .eq('status', 'vacant')
          .order('number'),
        supabase
          .from('bookings')
          .select('id, room_id, student_name, status, rooms(number, room_classes(name, price))')
          .order('created_at', { ascending: false }),
      ]);
      if (roomsRes.error) throw roomsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      setRooms((roomsRes.data ?? []) as unknown as Room[]);
      setMyBookings((bookingsRes.data ?? []) as unknown as Booking[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingRoom) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from('bookings').insert({
        room_id: bookingRoom.id,
        student_name: name.trim(),
        phone_number: phone.trim(),
      });
      if (error) throw error;
      setSuccess(`Booking request sent for room ${bookingRoom.number}. Management will review it.`);
      setBookingRoom(null);
      setName('');
      setPhone('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send booking request');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading rooms…</p>;

  const pending = myBookings.filter((b) => b.status === 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Find a Room</h1>
      <p className="text-neutral-500 mb-6">
        Browse vacant rooms and request a booking. Management approves every request.
      </p>

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

      {pending.length > 0 && (
        <div className="card mb-6 p-5">
          <h2 className="font-semibold text-neutral-900 mb-3">Your booking requests</h2>
          <ul className="space-y-2">
            {pending.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                <span>
                  Room <strong>{b.rooms?.number}</strong> — awaiting approval
                </span>
                <span className="font-semibold text-amber-700">Pending</span>
              </li>
            ))}
            {myBookings
              .filter((b) => b.status !== 'pending')
              .slice(0, 3)
              .map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm">
                  <span>
                    Room <strong>{b.rooms?.number}</strong>
                  </span>
                  <span className={b.status === 'approved' ? 'font-semibold text-brand-700' : 'font-semibold text-red-600'}>
                    {b.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {rooms.length === 0 ? (
        <p className="text-neutral-500">No vacant rooms right now — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-neutral-900">{room.number}</span>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                  {room.room_classes?.name}
                </span>
              </div>
              <p className="text-2xl font-bold text-brand-700 mb-4">
                KES {(room.room_classes?.price ?? 0).toLocaleString()}
                <span className="text-sm font-normal text-neutral-500">/month</span>
              </p>
              <button className="btn-primary mt-auto" onClick={() => setBookingRoom(room)}>
                Book this room
              </button>
            </div>
          ))}
        </div>
      )}

      {bookingRoom && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4" onClick={() => setBookingRoom(null)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              Book room {bookingRoom.number}
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              KES {(bookingRoom.room_classes?.price ?? 0).toLocaleString()}/month —{' '}
              {bookingRoom.room_classes?.name}
            </p>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label" htmlFor="book-name">
                  Your full name
                </label>
                <input
                  id="book-name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Wanjiku"
                />
              </div>
              <div>
                <label className="label" htmlFor="book-phone">
                  Phone number
                </label>
                <input
                  id="book-phone"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="2547XXXXXXXX"
                  pattern="2547[0-9]{8}"
                  title="Phone in format 2547XXXXXXXX"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Sending…' : 'Send request'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setBookingRoom(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
