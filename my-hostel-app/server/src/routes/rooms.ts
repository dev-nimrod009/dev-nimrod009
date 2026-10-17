import { Router } from 'express';
import prisma from '../prisma/client';
import { listRooms } from '../data/mockData';

const router = Router();

// Returns rooms grouped by class, supports ?floor=<name> and ?q=<search>
router.get('/', async (req, res) => {
  const { floor, q } = req.query as { floor?: string; q?: string };

  if (process.env.DATABASE_URL) {
    try {
      const rooms = await prisma.room.findMany({ include: { roomClass: true, tenant: true } });
      // map rooms into grouped structure with stats
      const grouped: Record<string, any> = {};
      for (const r of rooms) {
        const cls = r.roomClass?.name || 'Uncategorized';
        if (!grouped[cls]) grouped[cls] = { rooms: [], stats: { totalRooms: 0, occupied: 0, revenue: 0 } };
        const tenant = r.tenant
          ? { name: r.tenant.name, phoneNumber: r.tenant.phoneNumber, idNumber: `REG${r.tenant.id}` }
          : null;
        grouped[cls].rooms.push({ number: r.number, status: r.status, tenant, price: r.roomClass?.price });
        grouped[cls].stats.totalRooms += 1;
        if (tenant) grouped[cls].stats.occupied += 1;
      }
      // compute revenue by summing payments per tenant/class
      const payments = await prisma.payment.findMany({ include: { tenant: true } });
      for (const p of payments) {
        const cls = p.tenant?.room?.roomClassId ? (await prisma.room.findUnique({ where: { id: p.tenant!.roomId! }, include: { roomClass: true } }))?.roomClass?.name : null;
        if (cls && grouped[cls]) grouped[cls].stats.revenue = (grouped[cls].stats.revenue || 0) + p.amount;
      }

      // apply floor filter/search
      const result: Record<string, any> = {};
      for (const [cls, v] of Object.entries(grouped)) {
        let roomsList = v.rooms as any[];
        if (floor && cls !== floor) continue;
        if (q) roomsList = roomsList.filter((r) => r.number.toLowerCase().includes(q.toLowerCase()));
        result[cls] = { rooms: roomsList, stats: { ...v.stats, occupancyPercent: v.stats.totalRooms ? Math.round((v.stats.occupied / v.stats.totalRooms) * 100) : 0 } };
      }

      return res.json(result);
    } catch (err) {
      // If any DB error occurs (missing database, prisma issues), fallback to mock data
      console.warn('rooms route: db access failed, falling back to mock data', err);
    }
  }

  // use mock data
    // use mock data
    const rooms = listRooms();
    const grouped: Record<string, any> = {};
    for (const r of rooms) {
      const cls = r.className || 'Uncategorized';
      if (!grouped[cls]) grouped[cls] = { rooms: [], stats: { totalRooms: 0, occupied: 0, revenue: 0 } };
      // mock tenant info and financials for demo (derive from status)
      const hasTenant = r.status !== 'vacant';
      const tenant = hasTenant ? { name: `Student ${r.number}`, phoneNumber: `2547${Math.floor(Math.random() * 900000 + 100000)}`, idNumber: `REG${r.number}` } : null;
      const paid = hasTenant ? (r.price ? Math.floor(r.price * (r.status === 'paid' ? 1 : r.status === 'partial' ? 0.5 : 0)) : 0) : 0;
      grouped[cls].rooms.push({ number: r.number, status: r.status, tenant, price: r.price, paid, balance: r.price ? r.price - paid : 0 });
      grouped[cls].stats.totalRooms += 1;
      if (hasTenant) grouped[cls].stats.occupied += 1;
      grouped[cls].stats.revenue += paid;
    }

    // apply floor filter/search
    const result: Record<string, any> = {};
    for (const [cls, v] of Object.entries(grouped)) {
      let roomsList = v.rooms as any[];
      if (floor && cls !== floor) continue;
      if (q) roomsList = roomsList.filter((r) => r.number.toLowerCase().includes(q.toLowerCase()));
      result[cls] = { rooms: roomsList, stats: { ...v.stats, occupancyPercent: v.stats.totalRooms ? Math.round((v.stats.occupied / v.stats.totalRooms) * 100) : 0 } };
    }

    return res.json(result);
  }
});

export default router;
