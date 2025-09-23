import { Router } from 'express';
import { UserController } from '../../controllers/UserController';
import { authenticateToken } from '../../middleware/auth';
import type { AuthRequest } from '../../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         full_name:
 *           type: string
 *           description: User's full name
 *         password_hash:
 *           type: string
 *           description: Hashed password
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         email: user@example.com
 *         phone: +6281234567890
 *         full_name: User Example
 *         created_at: 2023-01-01T00:00:00.000Z
 */

const router: Router = Router();
const userController = new UserController();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void userController.getAllUsers(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void userController.getUserById(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               full_name:
 *                 type: string
 *               password_hash:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void userController.createUser(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               full_name:
 *                 type: string
 *               password_hash:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void userController.updateUser(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void userController.deleteUser(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

export default router;