import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type StudentPayment = {
  id: number;
  room_id: number | null;
  amount: number;
  mpesa_receipt: string | null;
  status: string;
  created_at: string;
  rooms: { number: string } | null;
};

export default function StudentPayments() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [bookedRooms, setBookedRooms] = useState<{ id: number; number: string; price: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [paymentsRes, approvedRes] = await Promise.all([
        supabase
          .from('student_payments')
          .select('id, room_id, amount, mpesa_receipt, status, created_at, rooms(number)')
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('room_id, status, rooms(id, number, room_classes(price))')
          .eq('status', 'approved'),
      ]);
      if (paymentsRes.error) throw paymentsRes.error;
      if (approvedRes.error) throw approvedRes.error;
      setPayments((paymentsRes.data ?? []) as unknown as StudentPayment[]);
      const approved = (approvedRes.data ?? []) as unknown as {
        room_id: number;
        rooms: { id: number; number: string; room_classes: { price: number } | null } | null;
      }[];
      setBookedRooms(
        approved
          .filter((b) => b.rooms)
          .map((b) => ({
            id: b.rooms!.id,
            number: b.rooms!.number,
            price: b.rooms!.room_classes?.price ?? null,
          })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.from('student_payments').insert({
        room_id: roomId ? Number(roomId) : null,
        amount: Number(amount),
        mpesa_receipt: receipt.trim() || null,
      });
      if (error) throw error;
      setSuccess('Payment submitted. The landlord will confirm it shortly.');
      setRoomId('');
      setAmount('');
      setReceipt('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit payment');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading…</p>;

  const selected = bookedRooms.find((r) => String(r.id) === roomId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Payments</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handlePay} className="card space-y-4 p-5">
          <h2 className="font-semibold text-neutral-900">Pay rent</h2>
          {bookedRooms.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Once management approves your booking, you can submit rent payments here.
            </p>
          ) : (
            <>
              <div>
                <label className="label" htmlFor="pay-room">
                  Room
                </label>
                <select
                  id="pay-room"
                  className="input"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  <option value="">Choose your room…</option>
                  {bookedRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.number}
                    </option>
                  ))}
                </select>
              </div>
              {selected?.price != null && (
                <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  Monthly rent: <strong>KES {selected.price.toLocaleString()}</strong>
                </p>
              )}
              <div>
                <label className="label" htmlFor="pay-amount">
                  Amount (KES)
                </label>
                <input
                  id="pay-amount"
                  type="number"
                  min="1"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="20000"
                />
              </div>
              <div>
                <label className="label" htmlFor="pay-receipt">
                  M-Pesa receipt code
                </label>
                <input
                  id="pay-receipt"
                  className="input"
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                  required
                  placeholder="SBK1234567"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Copy the code from the M-Pesa confirmation message.
                </p>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-brand-700">{success}</p>}
          {bookedRooms.length > 0 && (
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit payment'}
            </button>
          )}
        </form>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
              <h2 className="font-semibold text-neutral-900">Payment history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Receipt</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-5 py-3 text-neutral-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-neutral-700">{p.rooms?.number ?? '—'}</td>
                      <td className="px-5 py-3 font-semibold text-neutral-900">
                        KES {p.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-neutral-500">{p.mpesa_receipt ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.status === 'confirmed'
                              ? 'bg-brand-100 text-brand-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'confirmed' ? 'Confirmed' : 'Awaiting confirmation'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-neutral-500">
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
