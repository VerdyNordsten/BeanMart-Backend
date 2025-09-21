import { Router } from 'express';
import { UserAddressController } from '../../controllers/UserAddressController';

/**
 * @swagger
 * tags:
 *   name: User Addresses
 *   description: User address management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAddress:
 *       type: object
 *       required:
 *         - user_id
 *         - country
 *         - is_default
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user address
 *         user_id:
 *           type: string
 *           description: The ID of the user who owns this address
 *         label:
 *           type: string
 *           description: Address label (e.g., Home, Office)
 *         recipient_name:
 *           type: string
 *           description: Recipient's name
 *         phone:
 *           type: string
 *           description: Recipient's phone number
 *         address_line1:
 *           type: string
 *           description: First line of the address
 *         address_line2:
 *           type: string
 *           description: Second line of the address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State/Province
 *         postal_code:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country code (e.g., ID)
 *         is_default:
 *           type: boolean
 *           description: Whether this is the default address
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Address creation timestamp
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         user_id: 550e8400-e29b-41d4-a716-446655440001
 *         label: Home
 *         recipient_name: John Doe
 *         phone: +6281234567890
 *         address_line1: 123 Main St
 *         address_line2: Apt 4B
 *         city: Jakarta
 *         state: DKI Jakarta
 *         postal_code: 12345
 *         country: ID
 *         is_default: true
 *         created_at: 2023-01-01T00:00:00.000Z
 */

const router: Router = Router();
const userAddressController = new UserAddressController();

/**
 * @swagger
 * /user-addresses/user/{user_id}:
 *   get:
 *     summary: Get all addresses for a user
 *     tags: [User Addresses]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user addresses
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
 *                     $ref: '#/components/schemas/UserAddress'
 *       500:
 *         description: Internal server error
 */
router.get('/user/:user_id', userAddressController.getUserAddresses);

/**
 * @swagger
 * /user-addresses/{id}:
 *   get:
 *     summary: Get a user address by ID
 *     tags: [User Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Address ID
 *     responses:
 *       200:
 *         description: User address details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAddress'
 *       404:
 *         description: User address not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', userAddressController.getUserAddressById);

/**
 * @swagger
 * /user-addresses:
 *   post:
 *     summary: Create a new user address
 *     tags: [User Addresses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - country
 *               - is_default
 *             properties:
 *               user_id:
 *                 type: string
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAddress'
 *       500:
 *         description: Internal server error
 */
router.post('/', userAddressController.createUserAddress);

/**
 * @swagger
 * /user-addresses/{id}:
 *   put:
 *     summary: Update a user address
 *     tags: [User Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAddress'
 *       404:
 *         description: User address not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', userAddressController.updateUserAddress);

/**
 * @swagger
 * /user-addresses/{id}:
 *   delete:
 *     summary: Delete a user address
 *     tags: [User Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Address ID
 *     responses:
 *       200:
 *         description: User address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User address not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', userAddressController.deleteUserAddress);

/**
 * @swagger
 * /user-addresses/{id}/set-default:
 *   post:
 *     summary: Set user address as default
 *     tags: [User Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User address set as default successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAddress'
 *       404:
 *         description: User address not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/set-default', userAddressController.setDefaultAddress);

export default router;