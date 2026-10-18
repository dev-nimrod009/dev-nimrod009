import { supabase, type RoomGroup, type Room, type Tenant, type PaymentWithTenant } from './supabase';

export type TenantWithFinance = Tenant & {
  billed: number;
  paid: number;
  balance: number;
};

export async function fetchRoomGroups(): Promise<RoomGroup[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, number, status, room_classes(id, name, price, sort_order), tenants(id, name, phone_number, room_id)')
    .order('number');

  if (error) throw new Error(error.message);
  const rooms = (data ?? []) as unknown as Room[];

  const groups = new Map<number, RoomGroup>();
  for (const room of rooms) {
    const cls = room.room_classes;
    if (!cls) continue;
    if (!groups.has(cls.id)) {
      groups.set(cls.id, {
        className: cls.name,
        price: cls.price,
        rooms: [],
        stats: { totalRooms: 0, occupied: 0, occupancyPercent: 0, revenue: 0 },
      });
    }
    const group = groups.get(cls.id)!;
    group.rooms.push(room);
    group.stats.totalRooms += 1;
    if (room.tenants && room.tenants.length > 0) group.stats.occupied += 1;
  }

  const groupsArr = [...groups.values()].sort((a, b) => {
    const oa = rooms.find((r) => r.room_classes?.id && a.className === r.room_classes.name);
    const ob = rooms.find((r) => r.room_classes?.id && b.className === r.room_classes.name);
    return (oa?.room_classes?.sort_order ?? 0) - (ob?.room_classes?.sort_order ?? 0);
  });

  for (const group of groupsArr) {
    group.stats.occupancyPercent = group.stats.totalRooms
      ? Math.round((group.stats.occupied / group.stats.totalRooms) * 100)
      : 0;
    group.stats.revenue = group.rooms.reduce(
      (sum, r) => sum + (r.tenants ?? []).reduce((s, t) => s + (t.payments?.reduce((ps, p) => ps + p.amount, 0) ?? 0), 0),
      0,
    );
  }

  return groupsArr;
}

export async function fetchTenants(): Promise<TenantWithFinance[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select(
      'id, name, phone_number, room_id, rooms(number, room_classes(price)), bills(id, tenant_id, amount, month), payments(id, tenant_id, amount, mpesa_receipt, note, paid_at)',
    )
    .order('name');

  if (error) throw new Error(error.message);
  const tenants = (data ?? []) as unknown as Tenant[];
  return tenants.map((t) => {
    const billed = (t.bills ?? []).reduce((s, b) => s + b.amount, 0);
    const paid = (t.payments ?? []).reduce((s, p) => s + p.amount, 0);
    return { ...t, billed, paid, balance: billed - paid };
  });
}

export type NewTenant = { name: string; phone_number: string; room_id: number | null };

export async function createTenant(payload: NewTenant): Promise<void> {
  const { error } = await supabase.from('tenants').insert(payload);
  if (error) throw new Error(error.message);
  if (payload.room_id) {
    await supabase.from('rooms').update({ status: 'occupied' }).eq('id', payload.room_id);
  }
}

export async function deleteTenant(id: number, roomId: number | null): Promise<void> {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (roomId) {
    await supabase.from('rooms').update({ status: 'vacant' }).eq('id', roomId);
  }
}

export async function fetchPayments(): Promise<PaymentWithTenant[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, tenant_id, amount, mpesa_receipt, note, paid_at, tenants(name, rooms(number))')
    .order('paid_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PaymentWithTenant[];
}

export type NewPayment = { tenant_id: number; amount: number; mpesa_receipt?: string | null; note?: string | null };

export async function recordPayment(payload: NewPayment): Promise<void> {
  const { error } = await supabase.from('payments').insert(payload);
  if (error) throw new Error(error.message);
}

export async function fetchVacantRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, number, status, room_classes(id, name, price, sort_order), tenants(id)')
    .eq('status', 'vacant')
    .order('number');

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Room[];
}
