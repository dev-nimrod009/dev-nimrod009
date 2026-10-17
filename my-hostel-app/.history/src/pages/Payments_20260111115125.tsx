import { useEffect, useState } from 'react';
import "./Payments.scss";
import { fetchPayments, recordPayment } from '../lib/api';

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPayments().then((d) => { setPayments(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function addDummy() {
    if (payments.length === 0) return;
    const p = await recordPayment({ tenantId: payments[0].tenantId, amount: 1000 });
    setPayments((s) => [p, ...s]);
  }

  return (
    <div className="payments">
      <h2 className="page-title">Payments</h2>
      <div className="card">
        {loading ? 'Loading…' : payments.length === 0 ? 'No payments yet — transaction history will appear here.' : (
          <ul>
            {payments.map((p) => (
              <li key={p.id}>{p.createdAt} — Tenant {p.tenantId} — KES {p.amount} {p.mpesaReceipt ? `— ${p.mpesaReceipt}` : ''}</li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => addDummy()}>Add Dummy Payment</button>
      </div>
    </div>
  );
}
