import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

export async function login(email: string, password: string) {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
}

export async function fetchTenants() {
  const res = await API.get('/tenants');
  return res.data;
}

export async function createTenant(payload: { name: string; phoneNumber: string; roomNumber?: string }) {
  const res = await API.post('/tenants', payload);
  return res.data;
}

export async function fetchPayments() {
  const res = await API.get('/payments');
  return res.data;
}

export async function fetchRooms() {
  const res = await API.get('/rooms');
  return res.data;
}

export async function recordPayment(payload: { tenantId: number; amount: number; mpesaReceipt?: string }) {
  const res = await API.post('/payments', payload);
  return res.data;
}

export async function stkPush(payload: { tenantId: number; amount: number }) {
  const res = await API.post('/mpesa/stk-push', payload);
  return res.data;
}

export default API;
