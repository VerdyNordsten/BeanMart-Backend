import { Router } from 'express';
import { FileUploadController } from '../../controllers/FileUploadController';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { upload } from '../../middleware/uploadMiddleware';

const router: Router = Router();
const fileUploadController = new FileUploadController();

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: File upload endpoints for product images
 */

/**
 * @swagger
 * /file-upload/product-image:
 *   post:
 *     summary: Upload a product image (admin only)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - productId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the product to associate with the image
 *               position:
 *                 type: integer
 *                 description: Position of the image (1 = cover image)
 *     responses:
 *       201:
 *         description: Product image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or no file uploaded
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/product-image', 
  authenticateAdmin, 
  upload.single('file'), 
  (req, res) => fileUploadController.uploadProductImage(req, res)
);

/**
 * @swagger
 * /file-upload/product-images:
 *   post:
 *     summary: Upload multiple product images (admin only)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *               - productId
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the product to associate with the images
 *               positions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Positions of the images (1 = cover image)
 *     responses:
 *       201:
 *         description: Product images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductImage'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or no files uploaded
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/product-images', 
  authenticateAdmin, 
  upload.array('files', 10), 
  (req, res) => fileUploadController.uploadProductImages(req, res)
);

export default router;