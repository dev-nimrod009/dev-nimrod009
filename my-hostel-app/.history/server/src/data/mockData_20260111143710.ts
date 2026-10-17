/**
 * Simple in-memory store used for local dev when DB isn't set up.
 * This lets frontend and backend be integrated end-to-end without requiring a DB.
 */

type Tenant = {
  id: number;
  name: string;
  phoneNumber: string;
  roomNumber?: string;
};

type Payment = {
  id: number;
  tenantId: number;
  amount: number;
  mpesaReceipt?: string;
  createdAt: string;
};

const tenants: Tenant[] = [
  { id: 1, name: 'Alice Mwangi', phoneNumber: '254700000001', roomNumber: 'U01' },
  { id: 2, name: 'Brian Kimani', phoneNumber: '254700000002', roomNumber: '101' },
];

const payments: Payment[] = [];

type Room = {
  number: string;
  className: string;
  status?: 'paid' | 'partial' | 'vacant' | 'overdue';
  price?: number;
};

const rooms: Room[] = [];

// Generate rooms with requested naming scheme
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// Underground U001..U015
for (let i = 1; i <= 15; i++) rooms.push({ number: `U${String(i).padStart(3, '0')}`, className: 'Underground', status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partial' : 'vacant', price: 18000 });
// Ground Floor A001..O015 (15 rooms)
for (let i = 1; i <= 15; i++) rooms.push({ number: `${letters[i - 1]}${String(i).padStart(3, '0')}`, className: 'Ground Floor', status: i % 4 === 0 ? 'overdue' : i % 3 === 0 ? 'paid' : 'vacant', price: 20000 });
// First Floor A101..V122 (22 rooms)
for (let i = 1; i <= 22; i++) rooms.push({ number: `${letters[i - 1]}${String(100 + i)}`, className: 'First Floor', status: i % 5 === 0 ? 'overdue' : i % 2 === 0 ? 'paid' : 'partial', price: 22000 });
// Second Floor A201..P216 (16 rooms)
for (let i = 1; i <= 16; i++) rooms.push({ number: `${letters[i - 1]}${String(200 + i)}`, className: 'Second Floor', status: i % 2 === 0 ? 'vacant' : 'paid', price: 21000 });

let tenantIdSeq = tenants.length + 1;
let paymentIdSeq = 1;

export function listTenants() {
  return tenants;
}

export function addTenant(data: Omit<Tenant, 'id'>) {
  const t: Tenant = { id: tenantIdSeq++, ...data };
  tenants.push(t);
  return t;
}

export function listPayments() {
  return payments;
}

export function addPayment(data: Omit<Payment, 'id' | 'createdAt'>) {
  const p: Payment = { id: paymentIdSeq++, createdAt: new Date().toISOString(), ...data };
  payments.push(p);
  return p;
}

export function findTenant(id: number) {
  return tenants.find((t) => t.id === id);
}

export function listRooms() {
  return rooms;
}

export function addRoom(r: Room) {
  rooms.push(r);
  return r;
}
