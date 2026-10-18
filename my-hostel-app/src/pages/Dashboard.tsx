import { useEffect, useMemo, useState } from 'react';
import { fetchRoomGroups } from '../lib/data';
import type { RoomGroup } from '../lib/supabase';

export default function Dashboard() {
  const [groups, setGroups] = useState<RoomGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomGroups()
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const totalRooms = groups.reduce((s, g) => s + g.stats.totalRooms, 0);
    const occupied = groups.reduce((s, g) => s + g.stats.occupied, 0);
    const revenue = groups.reduce((s, g) => s + g.stats.revenue, 0);
    const occupancy = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
    return { totalRooms, occupied, revenue, occupancy };
  }, [groups]);

  if (loading) return <p className="text-neutral-500">Loading dashboard…</p>;
  if (error) return <p className="text-red-600">Could not load data: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            KES {totals.revenue.toLocaleString()}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Rooms Occupied</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {totals.occupied}/{totals.totalRooms}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Occupancy</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{totals.occupancy}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Vacant Rooms</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {totals.totalRooms - totals.occupied}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.className} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
              <div>
                <h2 className="font-semibold text-neutral-900">{g.className}</h2>
                <p className="text-sm text-neutral-500">
                  KES {g.price.toLocaleString()} / month · {g.stats.occupied} of{' '}
                  {g.stats.totalRooms} occupied ({g.stats.occupancyPercent}%)
                </p>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${g.stats.occupancyPercent}%` }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-neutral-500">
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Tenant</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rooms.map((room) => {
                    const tenant = room.tenants?.[0];
                    return (
                      <tr key={room.id} className="border-b border-neutral-100 last:border-0">
                        <td className="px-5 py-3 font-medium text-neutral-900">{room.number}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              room.status === 'occupied'
                                ? 'bg-brand-100 text-brand-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {room.status === 'occupied' ? 'Occupied' : 'Vacant'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-neutral-700">{tenant?.name ?? '—'}</td>
                        <td className="px-5 py-3 text-neutral-500">{tenant?.phone_number ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
