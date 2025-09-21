import type { Request, Response } from 'express';
import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import type { AuthRequest } from '../../middleware/auth';
import { authenticateToken } from '../../middleware/auth';

const router: Router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User and admin authentication endpoints
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
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *           description: Set to true for admin login
 *       example:
 *         email: user@example.com
 *         password: password123
 *         isAdmin: false
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (min 6 characters)
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Validation error
 *       409:
 *         description: User with this email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', (req: Request, res: Response) => authController.register(req, res));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user or admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User/admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user/admin profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User/admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: User/admin not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateToken, (req: AuthRequest, res: Response) => authController.getProfile(req, res));

export default router;