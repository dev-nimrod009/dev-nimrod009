import { Router } from 'express';
import prisma from '../prisma/client';
import { listPayments as listMockPayments, addPayment as addMockPayment, findTenant as findMockTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  if (process.env.DATABASE_URL) {
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(payments);
  }
  res.json(listMockPayments());
});

router.post('/', requireAuth, async (req, res) => {
  const { tenantId, amount, mpesaReceipt } = req.body;
  if (!tenantId || !amount) return res.status(400).json({ error: 'tenantId & amount required' });

  // Check tenant exists (DB or mock)
  if (process.env.DATABASE_URL) {
    const tenant = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
    if (!tenant) return res.status(404).json({ error: 'tenant not found' });

    try {
      const [payment] = await prisma.$transaction([
        prisma.payment.create({ data: { tenantId: Number(tenantId), amount: Number(amount), mpesaReceipt } }),
        prisma.ledger.upsert({
          where: { tenantId: Number(tenantId) },
          create: { tenantId: Number(tenantId), totalBilled: 0, currentBalance: -Number(amount) },
          update: { currentBalance: { decrement: Number(amount) } }
        })
      ]);
      return res.status(201).json(payment);
    } catch (err: any) {
      console.error('DB payment error', err);
      return res.status(500).json({ error: 'db_error', detail: String(err) });
    }
  }

  const tenant = findMockTenant(Number(tenantId));
  if (!tenant) return res.status(404).json({ error: 'tenant not found' });
  const p = addMockPayment({ tenantId: Number(tenantId), amount: Number(amount), mpesaReceipt });
  res.status(201).json(p);
});

export default router;