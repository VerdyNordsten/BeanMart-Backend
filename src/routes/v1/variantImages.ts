import { Router } from 'express';
import { VariantImageController } from '../../controllers/VariantImageController';
import { AdvancedFileUploadController } from '../../controllers/AdvancedFileUploadController';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { upload } from '../../middleware/uploadMiddleware';

const router: Router = Router();
const variantImageController = new VariantImageController();
const advancedFileUploadController = new AdvancedFileUploadController();

/**
 * @swagger
 * tags:
 *   name: Variant Images
 *   description: Variant image management with advanced upload options
 */

/**
 * @swagger
 * /variant-images:
 *   post:
 *     summary: Create a new variant image with local upload (admin only)
 *     tags: [Variant Images]
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
 *         description: Variant image created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the created variant image
 *                     variantId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the associated variant
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Public URL of the uploaded image
 *                     position:
 *                       type: integer
 *                       description: Position of the image (1 = cover image)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', 
  authenticateAdmin, 
  upload.single('file'), 
  (req, res) => variantImageController.createVariantImage(req, res)
);

/**
 * @swagger
 * /variant-images/multiple:
 *   post:
 *     summary: Create multiple variant images with local upload (admin only)
 *     tags: [Variant Images]
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
 *         description: Variant images created successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: ID of the created variant image
 *                       variantId:
 *                         type: string
 *                         format: uuid
 *                         description: ID of the associated variant
 *                       url:
 *                         type: string
 *                         format: uri
 *                         description: Public URL of the uploaded image
 *                       position:
 *                         type: integer
 *                         description: Position of the image (1 = cover image)
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last update timestamp
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/multiple', 
  authenticateAdmin, 
  upload.array('files', 10), 
  (req, res) => advancedFileUploadController.uploadMultipleFiles(req, res)
);

/**
 * @swagger
 * /variant-images/upload-advanced:
 *   post:
 *     summary: Upload a variant image by local upload, URL, or paste (admin only)
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Local file to upload
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the file to download and upload
 *               imageData:
 *                 type: string
 *                 description: Base64 encoded image data (pasted image)
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the variant to associate with the image
 *               position:
 *                 type: integer
 *                 description: Position of the image (1 = cover image)
 *           example:
 *             variantId: "123e4567-e89b-12d3-a456-426614174000"
 *             position: 1
 *             url: "https://example.com/image.jpg"
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the created variant image
 *                     variantId:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the associated variant
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Public URL of the uploaded image
 *                     position:
 *                       type: integer
 *                       description: Position of the image (1 = cover image)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
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
router.post('/upload-advanced', 
  authenticateAdmin, 
  upload.single('file'), 
  (req, res) => advancedFileUploadController.uploadFile(req, res)
);

/**
 * @swagger
 * /variant-images/upload-advanced-multiple:
 *   post:
 *     summary: Upload multiple variant images by various methods (admin only)
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple local files to upload
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs of files to download and upload
 *               imageDataArray:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Base64 encoded image data array
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the variant to associate with the images
 *               position:
 *                 type: integer
 *                 description: Position of the images (1 = cover image)
 *               positions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Specific positions for each image
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: ID of the created variant image
 *                       variantId:
 *                         type: string
 *                         format: uuid
 *                         description: ID of the associated variant
 *                       url:
 *                         type: string
 *                         format: uri
 *                         description: Public URL of the uploaded image
 *                       position:
 *                         type: integer
 *                         description: Position of the image (1 = cover image)
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last update timestamp
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
router.post('/upload-advanced-multiple', 
  authenticateAdmin, 
  upload.array('files', 10), 
  (req, res) => advancedFileUploadController.uploadMultipleFiles(req, res)
);

export default router;