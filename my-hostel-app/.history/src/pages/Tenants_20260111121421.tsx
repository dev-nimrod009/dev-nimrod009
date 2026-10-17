import { useEffect, useState } from "react";
import "./Tenants.scss";
import { fetchTenants, createTenant } from "../lib/api";

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTenants()
      .then((d) => {
        setTenants(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function addDummy() {
    const t = await createTenant({
      name: "New Tenant",
      phoneNumber: "254700000010",
      roomNumber: "G01",
    });
    setTenants((s) => [...s, t]);
  }

  return (
    <div className="tenants">
      <h2 className="page-title">Tenants</h2>
      <div className="card">
        {loading ? (
          "Loading…"
        ) : tenants.length === 0 ? (
          "No tenants yet — list will appear here."
        ) : (
          <ul>
            {tenants.map((t) => (
              <li
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {t.name} — {t.phoneNumber} — {t.roomNumber || "—"}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={async () => {
                      const a = prompt("Amount (KES) to request", "18000");
                      if (!a) return;
                      try {
                        const r = await (
                          await import("../lib/api")
                        ).stkPush({ tenantId: t.id, amount: Number(a) });
                        alert("STK Push initiated: " + JSON.stringify(r));
                      } catch (err: any) {
                        alert("Error initiating STK: " + (err?.message || err));
                      }
                    }}
                  >
                    Request Payment
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={addDummy}>Add Dummy Tenant</button>
      </div>
    </div>
  );
}
