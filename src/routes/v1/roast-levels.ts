import { Router } from 'express';
import { RoastLevelController } from '../../controllers/RoastLevelController';
import { authenticateToken } from '../../middleware/auth';
import type { AuthRequest } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Roast Levels
 *   description: Roast level management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RoastLevel:
 *       type: object
 *       required:
 *         - slug
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the roast level
 *         slug:
 *           type: string
 *           description: Unique slug for the roast level
 *         name:
 *           type: string
 *           description: Roast level name
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         slug: light-roast
 *         name: Light Roast
 */

const router: Router = Router();
const roastLevelController = new RoastLevelController();

/**
 * @swagger
 * /roast-levels:
 *   get:
 *     summary: Get all roast levels
 *     tags: [Roast Levels]
 *     security: []  # No authentication required
 *     responses:
 *       200:
 *         description: List of all roast levels
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
 *                     $ref: '#/components/schemas/RoastLevel'
 *       500:
 *         description: Internal server error
 */
router.get('/', roastLevelController.getAllRoastLevels);

/**
 * @swagger
 * /roast-levels/{id}:
 *   get:
 *     summary: Get a roast level by ID
 *     tags: [Roast Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Roast level ID
 *     responses:
 *       200:
 *         description: Roast level details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RoastLevel'
 *       404:
 *         description: Roast level not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', roastLevelController.getRoastLevelById);

/**
 * @swagger
 * /roast-levels/slug/{slug}:
 *   get:
 *     summary: Get a roast level by slug
 *     tags: [Roast Levels]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Roast level slug
 *     responses:
 *       200:
 *         description: Roast level details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RoastLevel'
 *       404:
 *         description: Roast level not found
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug', roastLevelController.getRoastLevelBySlug);

/**
 * @swagger
 * /roast-levels:
 *   post:
 *     summary: Create a new roast level (admin only)
 *     tags: [Roast Levels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - name
 *             properties:
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Roast level created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RoastLevel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void roastLevelController.createRoastLevel(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /roast-levels/{id}:
 *   put:
 *     summary: Update a roast level (admin only)
 *     tags: [Roast Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Roast level ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Roast level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RoastLevel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Roast level not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void roastLevelController.updateRoastLevel(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /roast-levels/{id}:
 *   delete:
 *     summary: Delete a roast level (admin only)
 *     tags: [Roast Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Roast level ID
 *     responses:
 *       200:
 *         description: Roast level deleted successfully
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
 *         description: Roast level not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void roastLevelController.deleteRoastLevel(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /roast-levels/{id}/products:
 *   get:
 *     summary: Get all products for a roast level
 *     tags: [Roast Levels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Roast level ID
 *     responses:
 *       200:
 *         description: List of product roast levels
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
 *                     $ref: '#/components/schemas/ProductRoastLevel'
 *       500:
 *         description: Internal server error
 */
router.get('/:id/products', roastLevelController.getProductsForRoastLevel);

export default router;
