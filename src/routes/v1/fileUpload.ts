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
 * /file-upload/variant-image:
 *   post:
 *     summary: Upload a variant image (admin only)
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
 *               - variantId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the variant to associate with the image
 *               position:
 *                 type: integer
 *                 description: Position of the image (1 = cover image)
 *     responses:
 *       201:
 *         description: Variant image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VariantImage'
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
router.post('/variant-image', 
  authenticateAdmin, 
  upload.single('file'), 
  (req, res) => fileUploadController.uploadVariantImage(req, res)
);

/**
 * @swagger
 * /file-upload/variant-images:
 *   post:
 *     summary: Upload multiple variant images (admin only)
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
 *               - variantId
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the variant to associate with the images
 *               positions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Positions of the images (1 = cover image)
 *     responses:
 *       201:
 *         description: Variant images uploaded successfully
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
 *                     $ref: '#/components/schemas/VariantImage'
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
router.post('/variant-images', 
  authenticateAdmin, 
  upload.array('files', 10), 
  (req, res) => fileUploadController.uploadVariantImages(req, res)
);

export default router;