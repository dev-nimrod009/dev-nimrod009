import { Router } from 'express';
import { health } from '../controllers/health';
import authRoutes from './auth';
import tenantsRoutes from './tenants';
import paymentsRoutes from './payments';
import mpesaRoutes from './mpesa';

const router = Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/mpesa', mpesaRoutes);

export default router;
