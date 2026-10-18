import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { fetchRoomGroups } from '../lib/data';
import type { RoomGroup } from '../lib/supabase';

type StatusFilter = 'all' | 'occupied' | 'vacant';

export default function Rooms() {
  const [groups, setGroups] = useState<RoomGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [floor, setFloor] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchRoomGroups()
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => floor === 'all' || g.className === floor)
      .map((g) => ({
        ...g,
        rooms: g.rooms.filter((r) => {
          if (q && !r.number.toLowerCase().includes(q)) return false;
          if (status === 'occupied' && r.status !== 'occupied') return false;
          if (status === 'vacant' && r.status !== 'vacant') return false;
          return true;
        }),
      }))
      .filter((g) => g.rooms.length > 0);
  }, [groups, query, floor, status]);

  if (loading) return <p className="text-neutral-500">Loading rooms…</p>;
  if (error) return <p className="text-red-600">Could not load rooms: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Rooms</h1>

      <div className="card mb-6 flex flex-wrap items-end gap-4 p-4">
        <div className="min-w-48 flex-1">
          <label className="label" htmlFor="room-search">
            Search room number
          </label>
          <input
            id="room-search"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. A101 or U005"
          />
        </div>
        <div>
          <label className="label" htmlFor="floor-filter">
            Floor
          </label>
          <select
            id="floor-filter"
            className="input"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option value="all">All floors</option>
            {groups.map((g) => (
              <option key={g.className} value={g.className}>
                {g.className}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map((g) => (
          <section key={g.className} className="card overflow-hidden">
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
              <h2 className="font-semibold text-neutral-900">
                {g.className}{' '}
                <span className="text-sm font-normal text-neutral-500">
                  · {g.rooms.length} rooms shown · KES {g.price.toLocaleString()}/mo
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 lg:grid-cols-6">
              {g.rooms.map((room) => {
                const tenant = room.tenants?.[0];
                return (
                  <div
                    key={room.id}
                    className={`rounded-lg border p-3 transition-shadow hover:shadow-md ${
                      room.status === 'occupied'
                        ? 'border-brand-200 bg-brand-50'
                        : 'border-neutral-200 bg-white'
                    }`}
                    title={tenant ? `${tenant.name} · ${tenant.phone_number}` : 'Vacant'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{room.number}</span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          room.status === 'occupied' ? 'bg-brand-500' : 'bg-neutral-300'
                        }`}
                      />
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {tenant?.name ?? 'Vacant'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="text-neutral-500">No rooms match your filters.</p>
        )}
      </div>
    </div>
  );
}
