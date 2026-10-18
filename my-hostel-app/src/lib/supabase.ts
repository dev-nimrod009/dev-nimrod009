import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RoomClass = {
  id: number;
  name: string;
  price: number;
  sort_order: number;
};

export type Room = {
  id: number;
  number: string;
  class_id: number | null;
  status: 'vacant' | 'occupied';
  room_classes: RoomClass | null;
  tenants: Tenant[] | null;
};

export type Tenant = {
  id: number;
  name: string;
  phone_number: string;
  room_id: number | null;
  rooms: Room | null;
  bills: Bill[] | null;
  payments: Payment[] | null;
};

export type Bill = {
  id: number;
  tenant_id: number;
  amount: number;
  month: string;
};

export type Payment = {
  id: number;
  tenant_id: number;
  amount: number;
  mpesa_receipt: string | null;
  note: string | null;
  paid_at: string;
};

export type PaymentWithTenant = Payment & {
  tenants: { name: string; rooms: { number: string } | null } | null;
};

export type RoomGroup = {
  className: string;
  price: number;
  rooms: Room[];
  stats: {
    totalRooms: number;
    occupied: number;
    occupancyPercent: number;
    revenue: number;
  };
};
