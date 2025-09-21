import type { Request, Response } from 'express';
import { Router } from 'express';

// Import individual route files
import userRoutes from './v1/users';
import userAddressRoutes from './v1/userAddresses';
import productRoutes from './v1/products';
import categoryRoutes from './v1/categories';
import productCategoryRoutes from './v1/productCategories';
import productImageRoutes from './v1/productImages';
import productOptionTypeRoutes from './v1/productOptionTypes';
import productOptionRoutes from './v1/productOptions';
import productVariantRoutes from './v1/productVariants';
import variantImageRoutes from './v1/variantImages';
import authRoutes from './v1/auth';
import orderRoutes from './v1/orders';
import fileUploadRoutes from './v1/fileUpload';

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
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/user-addresses', userAddressRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/product-categories', productCategoryRoutes);
router.use('/product-images', productImageRoutes);
router.use('/product-option-types', productOptionTypeRoutes);
router.use('/product-options', productOptionRoutes);
router.use('/product-variants', productVariantRoutes);
router.use('/variant-images', variantImageRoutes);
router.use('/orders', orderRoutes);
router.use('/file-upload', fileUploadRoutes);

export default router;