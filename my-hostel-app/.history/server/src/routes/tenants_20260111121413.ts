import { Router } from 'express';
import prisma from '../prisma/client';
import { listTenants as listMockTenants, addTenant as addMockTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  if (process.env.DATABASE_URL) {
    const tenants = await prisma.tenant.findMany({ include: { ledger: true, room: true } });
    return res.json(tenants);
  }
  res.json(listMockTenants());
});

router.post('/', requireAuth, async (req, res) => {
  const { name, phoneNumber, roomNumber } = req.body;
  if (!name || !phoneNumber) return res.status(400).json({ error: 'name & phoneNumber required' });

  if (process.env.DATABASE_URL) {
    try {
      const t = await prisma.tenant.create({ data: { name, phoneNumber, room: { connectOrCreate: { where: { number: roomNumber || 'UNASSIGNED' }, create: { number: roomNumber || 'UNASSIGNED' } } } } });
      // create ledger for tenant
      await prisma.ledger.create({ data: { tenantId: t.id, totalBilled: 0, currentBalance: 0 } });
      return res.status(201).json(t);
    } catch (err: any) {
      console.error('DB tenant create error', err);
      return res.status(500).json({ error: 'db_error', detail: String(err) });
    }
  }

  const t = addMockTenant({ name, phoneNumber, roomNumber });
  res.status(201).json(t);
});

export default router;