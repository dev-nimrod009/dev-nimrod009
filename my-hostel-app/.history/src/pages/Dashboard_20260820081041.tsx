import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import { fetchRooms } from "../lib/api";
import mockRooms from "../data/mockRooms";
import "./Dashboard.scss";

type Room = {
  number: string;
  status?: "paid" | "partial" | "vacant" | "overdue";
  price?: number;
};

export default function Dashboard() {
  const [groups, setGroups] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRooms(
      selectedFloor ? { floor: selectedFloor, q: query } : { q: query },
    )
      .then((data) => {
        if (!mounted) return;
        setGroups(data);
      })
      .catch((_e) => {
        // fallback to client-side mock data for a reliable UX when backend isn't available
        if (!mounted) return;
        setGroups(mockRooms as any);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [selectedFloor, query]);

  const totalRooms = Object.values(groups).flatMap(
    (g: any) => g.rooms || [],
  ).length;
  const occupied = Object.values(groups)
    .flatMap((g: any) => g.rooms || [])
    .filter((r: any) => r.tenant || (r.status && r.status !== "vacant")).length;
  const totalRevenue = Object.values(groups).reduce(
    (sum: number, g: any) => sum + ((g.stats && g.stats.revenue) || 0),
    0,
  );
  const totalOutstanding = Object.values(groups)
    .flatMap((g: any) => g.rooms || [])
    .reduce((s: number, r: any) => s + (r.balance || 0), 0);

  return (
    <div className="dashboard">
      <h2 className="page-title">Dashboard</h2>
      <div className="summary">
        <div className="card">Total Revenue: KES {totalRevenue}</div>
        <div className="card">Outstanding: KES {totalOutstanding}</div>
        <div className="card">
          Rooms: {occupied}/{totalRooms || "—"}
        </div>
      </div>

      <div className="controls">
        <label>
          Filter floor:
          <select
            value={selectedFloor || ""}
            onChange={(e) => setSelectedFloor(e.target.value || null)}
          >
            <option value="">All</option>
            <option>Underground</option>
            <option>Ground Floor</option>
            <option>First Floor</option>
            <option>Second Floor</option>
          </select>
        </label>
        <label style={{ marginLeft: 12 }}>
          Search room:
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. A101 or U005"
          />
        </label>
      </div>

      {loading && <div>Loading rooms...</div>}

      {!loading && (
        <div>
          {["Underground", "Ground Floor", "First Floor", "Second Floor"]
            .filter((k) => groups[k])
            .map((className) => ({ className, data: groups[className] }))
            .map(({ className, data }) => (
              <section className="room-group" key={className}>
                <h4>
                  {className} — {data.stats?.totalRooms || data.rooms.length}{" "}
                  rooms
                </h4>
                <div className="stats">
                  Occupied: {data.stats?.occupied || 0} (
                  {data.stats?.occupancyPercent || 0}%) — Revenue: KES{" "}
                  {data.stats?.revenue || 0}
                </div>

                <table className="room-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Tenant</th>
                      <th>Phone</th>
                      <th>Reg #</th>
                      <th>Paid</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rooms.map((r: any) => (
                      <tr key={r.number}>
                        <td>{r.number}</td>
                        <td>{r.tenant?.name || "—"}</td>
                        <td>{r.tenant?.phoneNumber || "—"}</td>
                        <td>
                          {r.tenant?.idNumber || r.tenant?.idNumber || "—"}
                        </td>
                        <td>
                          {r.paid != null
                            ? `KES ${r.paid}`
                            : r.paidAmount
                              ? `KES ${r.paidAmount}`
                              : "—"}
                        </td>
                        <td>{r.balance != null ? `KES ${r.balance}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
