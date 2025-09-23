import { Router } from 'express';
import { VariantImageController } from '../../controllers/VariantImageController';
import { authenticateToken } from '../../middleware/auth';
import type { AuthRequest } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Variant Images
 *   description: Variant image management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VariantImage:
 *       type: object
 *       required:
 *         - variant_id
 *         - url
 *         - position
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the variant image
 *         variant_id:
 *           type: string
 *           description: The ID of the variant
 *         url:
 *           type: string
 *           description: Image URL
 *         position:
 *           type: integer
 *           description: Image position
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         variant_id: 550e8400-e29b-41d4-a716-446655440001
 *         url: https://example.com/image.jpg
 *         position: 1
 */

const router: Router = Router();
const variantImageController = new VariantImageController();

/**
 * @swagger
 * /variant-images/variant/{variant_id}:
 *   get:
 *     summary: Get all images for a variant
 *     tags: [Variant Images]
 *     parameters:
 *       - in: path
 *         name: variant_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: List of variant images
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
 *       500:
 *         description: Internal server error
 */
router.get('/variant/:variant_id', variantImageController.getVariantImages);

/**
 * @swagger
 * /variant-images/{id}:
 *   get:
 *     summary: Get a variant image by ID
 *     tags: [Variant Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Variant Image ID
 *     responses:
 *       200:
 *         description: Variant image details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VariantImage'
 *       404:
 *         description: Variant image not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', variantImageController.getVariantImageById);

/**
 * @swagger
 * /variant-images:
 *   post:
 *     summary: Create a new variant image (admin only)
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variant_id
 *               - url
 *               - position
 *             properties:
 *               variant_id:
 *                 type: string
 *               url:
 *                 type: string
 *               position:
 *                 type: integer
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
 *                   $ref: '#/components/schemas/VariantImage'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void variantImageController.createVariantImage(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /variant-images/{id}:
 *   put:
 *     summary: Update a variant image (admin only)
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Variant Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Variant image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/VariantImage'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Variant image not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void variantImageController.updateVariantImage(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /variant-images/{id}:
 *   delete:
 *     summary: Delete a variant image (admin only)
 *     tags: [Variant Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Variant Image ID
 *     responses:
 *       200:
 *         description: Variant image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Variant image not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void variantImageController.deleteVariantImage(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

export default router;