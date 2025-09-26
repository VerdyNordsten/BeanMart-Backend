import { Router } from 'express';
import { ProductRelationController } from '../../controllers/ProductRelationController';
import { authenticateToken } from '../../middleware/auth';
import type { AuthRequest } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Product Relations
 *   description: Product category and roast level relations management
 */

const router: Router = Router();
const productRelationController = new ProductRelationController();

/**
 * @swagger
 * /product-relations/{productId}:
 *   put:
 *     summary: Update product categories and roast levels (admin only)
 *     tags: [Product Relations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs
 *               roastLevels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of roast level IDs
 *     responses:
 *       200:
 *         description: Product relations updated successfully
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
 *       500:
 *         description: Internal server error
 */
router.put('/:productId', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void productRelationController.updateProductRelations(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /product-relations/{productId}:
 *   get:
 *     summary: Get product categories and roast levels
 *     tags: [Product Relations]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product relations retrieved successfully
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     roastLevels:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Internal server error
 */
router.get('/:productId', productRelationController.getProductRelations);

export default router;
