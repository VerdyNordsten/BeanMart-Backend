import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

// Mount versioned routes (only v1 for now)
router.use('/v1', v1Routes);

export default router;