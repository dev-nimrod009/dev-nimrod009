import { Router } from 'express';
import { listPayments, addPayment, findTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json(listPayments());
});

router.post('/', requireAuth, (req, res) => {
  const { tenantId, amount, mpesaReceipt } = req.body;
  if (!tenantId || !amount) return res.status(400).json({ error: 'tenantId & amount required' });
  const tenant = findTenant(Number(tenantId));
  if (!tenant) return res.status(404).json({ error: 'tenant not found' });
  const p = addPayment({ tenantId: Number(tenantId), amount: Number(amount), mpesaReceipt });
  res.status(201).json(p);
});

export default router;