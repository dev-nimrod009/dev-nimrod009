import { useEffect, useMemo, useState } from 'react';
import { fetchPayments, fetchTenants, recordPayment, type TenantWithFinance } from '../lib/data';
import type { PaymentWithTenant } from '../lib/supabase';

export default function Payments() {
  const [payments, setPayments] = useState<PaymentWithTenant[]>([]);
  const [tenants, setTenants] = useState<TenantWithFinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [p, t] = await Promise.all([fetchPayments(), fetchTenants()]);
      setPayments(p);
      setTenants(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = useMemo(
    () => tenants.find((t) => String(t.id) === tenantId),
    [tenants, tenantId],
  );

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return payments
      .filter((p) => {
        const d = new Date(p.paid_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await recordPayment({
        tenant_id: Number(tenantId),
        amount: Number(amount),
        mpesa_receipt: receipt.trim() || null,
      });
      setSuccess(`Recorded KES ${Number(amount).toLocaleString()} for ${selected?.name}.`);
      setTenantId('');
      setAmount('');
      setReceipt('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-neutral-500">Loading payments…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Payments</h1>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleRecord} className="card space-y-4 p-5">
          <h2 className="font-semibold text-neutral-900">Record a payment</h2>
          <div>
            <label className="label" htmlFor="pay-tenant">
              Tenant
            </label>
            <select
              id="pay-tenant"
              className="input"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            >
              <option value="">Choose a tenant…</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.rooms ? `(Room ${t.rooms.number})` : ''}
                </option>
              ))}
            </select>
          </div>
          {selected && (
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Balance due:{' '}
              <span className={selected.balance > 0 ? 'font-semibold text-red-600' : 'font-semibold text-brand-600'}>
                KES {selected.balance.toLocaleString()}
              </span>
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
              M-Pesa receipt (optional)
            </label>
            <input
              id="pay-receipt"
              className="input"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="SBK1234567"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-brand-700">{success}</p>}
          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Record payment'}
          </button>
        </form>

        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Payment history</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              KES {totalThisMonth.toLocaleString()} this month
            </span>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Tenant</th>
                  <th className="py-2 pr-4 font-medium">Room</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2 pr-4 text-neutral-500">
                      {new Date(p.paid_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4 font-medium text-neutral-900">
                      {p.tenants?.name ?? '—'}
                    </td>
                    <td className="py-2 pr-4 text-neutral-500">
                      {p.tenants?.rooms?.number ?? '—'}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-brand-700">
                      KES {p.amount.toLocaleString()}
                    </td>
                    <td className="py-2 text-neutral-500">{p.mpesa_receipt ?? '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
