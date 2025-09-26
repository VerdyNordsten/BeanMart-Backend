import { Router } from 'express';
import { OrderController } from '../../controllers/OrderController';
import { authenticateToken } from '../../middleware/auth';
import type { AuthRequest } from '../../middleware/auth';

const router: Router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user_id
 *         - order_number
 *         - status
 *         - total_amount
 *         - currency
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the order
 *         user_id:
 *           type: string
 *           description: ID of the user who placed the order
 *         order_number:
 *           type: string
 *           description: Unique order number
 *         status:
 *           type: string
 *           description: Order status (pending, confirmed, shipped, delivered, cancelled)
 *         total_amount:
 *           type: number
 *           description: Total order amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         shipping_address:
 *           type: object
 *           description: Shipping address (JSON)
 *         billing_address:
 *           type: object
 *           description: Billing address (JSON)
 *         notes:
 *           type: string
 *           description: Additional notes
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Order creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Order last update timestamp
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         user_id: 123e4567-e89b-12d3-a456-426614174000
 *         order_number: ORD-1234567890-123
 *         status: pending
 *         total_amount: 250000
 *         currency: USD
 *         shipping_address: { "name": "John Doe", "address": "123 Main St", "city": "Jakarta" }
 *         billing_address: { "name": "John Doe", "address": "123 Main St", "city": "Jakarta" }
 *         notes: Please deliver after 5 PM
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 *     OrderItem:
 *       type: object
 *       required:
 *         - order_id
 *         - product_variant_id
 *         - quantity
 *         - price_per_unit
 *         - total_price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the order item
 *         order_id:
 *           type: string
 *           description: ID of the order
 *         product_variant_id:
 *           type: string
 *           description: ID of the product variant
 *         quantity:
 *           type: integer
 *           description: Quantity ordered
 *         price_per_unit:
 *           type: number
 *           description: Price per unit
 *         total_price:
 *           type: number
 *           description: Total price for this item
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Order item creation timestamp
 *       example:
 *         id: 660e8400-e29b-41d4-a716-446655440000
 *         order_id: 550e8400-e29b-41d4-a716-446655440000
 *         product_variant_id: 770e8400-e29b-41d4-a716-446655440000
 *         quantity: 2
 *         price_per_unit: 125000
 *         total_price: 250000
 *         created_at: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void orderController.getAllOrders(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
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
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my', authenticateToken, orderController.getOrdersByUserId);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to view this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, orderController.getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productVariantId
 *                     - quantity
 *                     - pricePerUnit
 *                     - totalPrice
 *                   properties:
 *                     productVariantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     pricePerUnit:
 *                       type: number
 *                     totalPrice:
 *                       type: number
 *               shipping_address:
 *                 type: object
 *               billing_address:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or stock issue
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, orderController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               shipping_address:
 *                 type: object
 *               billing_address:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void orderController.updateOrder(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
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
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void orderController.deleteOrder(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/status', authenticateToken, (req: AuthRequest, res) => {
  if (req.isAdmin) {
    void orderController.updateOrderStatus(req, res);
  } else {
    res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
  }
});

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled at this stage
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

export default router;