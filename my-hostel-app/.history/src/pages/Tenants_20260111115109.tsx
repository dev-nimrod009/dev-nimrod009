import { useEffect, useState } from 'react';
import "./Tenants.scss";
import { fetchTenants, createTenant } from '../lib/api';

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTenants().then((d) => { setTenants(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function addDummy() {
    const t = await createTenant({ name: 'New Tenant', phoneNumber: '254700000010', roomNumber: 'G01' });
    setTenants((s) => [...s, t]);
  }

  return (
    <div className="tenants">
      <h2 className="page-title">Tenants</h2>
      <div className="card">
        {loading ? 'Loading…' : tenants.length === 0 ? 'No tenants yet — list will appear here.' : (
          <ul>
            {tenants.map((t) => (
              <li key={t.id}>{t.name} — {t.phoneNumber} — {t.roomNumber || '—'}</li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={addDummy}>Add Dummy Tenant</button>
      </div>
    </div>
  );
}
