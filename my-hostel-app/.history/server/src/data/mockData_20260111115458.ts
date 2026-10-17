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
