import { Router } from 'express';
import coffeeRoutes from './coffeeRoutes';

const router = Router();

// Mount all v1 routes
router.use('/', coffeeRoutes);

export default router;