import { Router } from 'express';
import { health } from '../controllers/health';
import authRoutes from './auth';
import tenantsRoutes from './tenants';
import paymentsRoutes from './payments';
import mpesaRoutes from './mpesa';
import roomsRoutes from './rooms';

const router = Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/mpesa', mpesaRoutes);
router.use('/rooms', roomsRoutes);

export default router;
