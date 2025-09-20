import { Router, Request, Response } from 'express';

// Import individual route files
import userRoutes from './v1/users';
import productRoutes from './v1/products';
import categoryRoutes from './v1/categories';

const router: Router = Router();

// Health check for API v1
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    version: 'v1',
    message: 'Beanmart API v1 is running' 
  });
});

// Mount individual routes
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;