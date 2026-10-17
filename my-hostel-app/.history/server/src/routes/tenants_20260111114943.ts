import { Router } from 'express';
import { listTenants, addTenant } from '../data/mockData';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json(listTenants());
});

router.post('/', requireAuth, (req, res) => {
  const { name, phoneNumber, roomNumber } = req.body;
  if (!name || !phoneNumber) return res.status(400).json({ error: 'name & phoneNumber required' });
  const t = addTenant({ name, phoneNumber, roomNumber });
  res.status(201).json(t);
});

export default router;