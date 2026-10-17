import { Router } from 'express';
import { addPayment, findTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';
import { stkPush, handleDarajaCallback } from '../services/mpesa';

const router = Router();

// Initiate STK Push (sandbox if configured, else simulated)
router.post('/stk-push', requireAuth, async (req, res) => {
  const { tenantId, amount } = req.body;
  if (!tenantId || !amount) return res.status(400).json({ error: 'tenantId & amount required' });
  const tenant = findTenant(Number(tenantId));
  if (!tenant) return res.status(404).json({ error: 'tenant not found' });

  const response = await stkPush({ tenantId: Number(tenantId), amount: Number(amount), phoneNumber: tenant.phoneNumber });
  res.json(response);
});

// M-Pesa callback receiver (Daraja POSTs here in real integration)
router.post('/callback', async (req, res) => {
  const body = req.body;
  const result = await handleDarajaCallback(body);
  res.json({ status: 'received', processed: result });
});

export default router;