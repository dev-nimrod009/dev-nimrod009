import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev_secret';

// DEV: hardcoded landlord user for local development
const DEV_USER = { id: 1, email: 'landlord@example.com', passwordHash: bcrypt.hashSync('password', 10) };

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  // simple dev auth: accept the hardcoded user
  if (email === DEV_USER.email) {
    const ok = await bcrypt.compare(password, DEV_USER.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ id: DEV_USER.id, email: DEV_USER.email }, SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: DEV_USER.id, email: DEV_USER.email } });
  }

  return res.status(401).json({ error: 'invalid credentials' });
});

export default router;
