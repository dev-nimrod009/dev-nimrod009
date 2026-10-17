const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type Room = {
  number: string;
  className: string;
  status?: 'paid' | 'partial' | 'vacant' | 'overdue';
  price?: number;
  tenant?: { name: string; phoneNumber: string; idNumber: string } | null;
  paid?: number;
  balance?: number;
};

const rooms: Room[] = [];

// Underground U001..U015
for (let i = 1; i <= 15; i++) {
  const num = `U${String(i).padStart(3, '0')}`;
  const price = 18000;
  const status = i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'vacant';
  const hasTenant = status !== 'vacant';
  const paid = hasTenant ? (status === 'paid' ? price : Math.floor(price / 2)) : 0;
  rooms.push({ number: num, className: 'Underground', status, price, tenant: hasTenant ? { name: `Student ${num}`, phoneNumber: `2547${100000 + i}`, idNumber: `REG${num}` } : null, paid, balance: price - paid });
}

// Ground Floor A001..O015
for (let i = 1; i <= 15; i++) {
  const num = `${letters[i - 1]}${String(i).padStart(3, '0')}`;
  const price = 20000;
  const status = i % 4 === 0 ? 'overdue' : i % 3 === 0 ? 'paid' : 'vacant';
  const hasTenant = status !== 'vacant';
  const paid = hasTenant ? (status === 'paid' ? price : status === 'overdue' ? Math.floor(price * 0.2) : Math.floor(price / 2)) : 0;
  rooms.push({ number: num, className: 'Ground Floor', status, price, tenant: hasTenant ? { name: `Student ${num}`, phoneNumber: `2547${200000 + i}`, idNumber: `REG${num}` } : null, paid, balance: price - paid });
}

// First Floor A101..V122 (22 rooms)
for (let i = 1; i <= 22; i++) {
  const num = `${letters[i - 1]}${String(100 + i)}`;
  const price = 22000;
  const status = i % 5 === 0 ? 'overdue' : i % 2 === 0 ? 'paid' : 'partial';
  const hasTenant = status !== 'vacant';
  const paid = hasTenant ? (status === 'paid' ? price : status === 'partial' ? Math.floor(price / 2) : Math.floor(price * 0.2)) : 0;
  rooms.push({ number: num, className: 'First Floor', status, price, tenant: hasTenant ? { name: `Student ${num}`, phoneNumber: `2547${300000 + i}`, idNumber: `REG${num}` } : null, paid, balance: price - paid });
}

// Second Floor A201..P216 (16 rooms)
for (let i = 1; i <= 16; i++) {
  const num = `${letters[i - 1]}${String(200 + i)}`;
  const price = 21000;
  const status = i % 2 === 0 ? 'vacant' : 'paid';
  const hasTenant = status !== 'vacant';
  const paid = hasTenant ? (status === 'paid' ? price : 0) : 0;
  rooms.push({ number: num, className: 'Second Floor', status, price, tenant: hasTenant ? { name: `Student ${num}`, phoneNumber: `2547${400000 + i}`, idNumber: `REG${num}` } : null, paid, balance: price - paid });
}

// Group by class
const grouped: Record<string, any> = {};
for (const r of rooms) {
  if (!grouped[r.className]) grouped[r.className] = { rooms: [], stats: { totalRooms: 0, occupied: 0, revenue: 0 } };
  grouped[r.className].rooms.push(r);
  grouped[r.className].stats.totalRooms += 1;
  if (r.tenant) grouped[r.className].stats.occupied += 1;
  grouped[r.className].stats.revenue += r.paid || 0;
}

for (const k of Object.keys(grouped)) {
  const s = grouped[k].stats;
  s.occupancyPercent = s.totalRooms ? Math.round((s.occupied / s.totalRooms) * 100) : 0;
}

export default grouped;
