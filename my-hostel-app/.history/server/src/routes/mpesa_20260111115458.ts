import { Router } from 'express';
import { addPayment, findTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Initiate STK Push (DEV - simulated)
router.post('/stk-push', requireAuth, (req, res) => {
  const { tenantId, amount } = req.body;
  if (!tenantId || !amount) return res.status(400).json({ error: 'tenantId & amount required' });
  const tenant = findTenant(Number(tenantId));
  if (!tenant) return res.status(404).json({ error: 'tenant not found' });

  // In sandbox we would call Daraja. For now simulate an STK request and return a simulated checkout id.
  const checkoutRequestID = `STK_SIM_${Date.now()}`;

  // Respond with checkout id so frontend can poll or wait for callback
  res.json({ checkoutRequestID, status: 'processing' });
});

// M-Pesa callback receiver (Daraja POSTs here in real integration)
router.post('/callback', (req, res) => {
  // For now accept the payload and create a payment if it contains amount and phone
  const body = req.body;
  // Example simplified: { TenantPhone, Amount, MpesaReceipt }
  const mpesaReceipt = body.MpesaReceipt || body.mpesaReceipt;
  const phone = body.TenantPhone || body.phoneNumber || body.phone;
  const amount = Number(body.Amount || body.amount || 0);

  // Try to find tenant by phone
  if (phone && amount > 0) {
    const tenant = findTenant( Number( phone.replace(/^254/, '') ) ) || undefined;
    // fallback: accept tenantId if provided
    const tenantId = body.tenantId || (tenant && tenant.id);
    if (tenantId) {
      const payment = addPayment({ tenantId: Number(tenantId), amount, mpesaReceipt });
      return res.json({ status: 'ok', payment });
    }
  }

  // Generic ack
  res.json({ status: 'received' });
});

export default router;