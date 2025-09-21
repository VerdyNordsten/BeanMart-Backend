import { Router } from 'express';
import { ProductOptionTypeController } from '../../controllers/ProductOptionTypeController';

/**
 * @swagger
 * tags:
 *   name: Product Option Types
 *   description: Product option type management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductOptionType:
 *       type: object
 *       required:
 *         - product_id
 *         - name
 *         - position
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product option type
 *         product_id:
 *           type: string
 *           description: The ID of the product
 *         name:
 *           type: string
 *           description: Option type name (e.g., Size, Color, Roast)
 *         position:
 *           type: integer
 *           description: Option type position
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         product_id: 550e8400-e29b-41d4-a716-446655440001
 *         name: Size
 *         position: 1
 */

const router: Router = Router();
const productOptionTypeController = new ProductOptionTypeController();

/**
 * @swagger
 * /product-option-types/product/{product_id}:
 *   get:
 *     summary: Get all option types for a product
 *     tags: [Product Option Types]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product option types
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
 *                     $ref: '#/components/schemas/ProductOptionType'
 *       500:
 *         description: Internal server error
 */
router.get('/product/:product_id', productOptionTypeController.getProductOptionTypes);

/**
 * @swagger
 * /product-option-types/{id}:
 *   get:
 *     summary: Get a product option type by ID
 *     tags: [Product Option Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option Type ID
 *     responses:
 *       200:
 *         description: Product option type details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOptionType'
 *       404:
 *         description: Product option type not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productOptionTypeController.getProductOptionTypeById);

/**
 * @swagger
 * /product-option-types:
 *   post:
 *     summary: Create a new product option type
 *     tags: [Product Option Types]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - name
 *               - position
 *             properties:
 *               product_id:
 *                 type: string
 *               name:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product option type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOptionType'
 *       500:
 *         description: Internal server error
 */
router.post('/', productOptionTypeController.createProductOptionType);

/**
 * @swagger
 * /product-option-types/{id}:
 *   put:
 *     summary: Update a product option type
 *     tags: [Product Option Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product option type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOptionType'
 *       404:
 *         description: Product option type not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', productOptionTypeController.updateProductOptionType);

/**
 * @swagger
 * /product-option-types/{id}:
 *   delete:
 *     summary: Delete a product option type
 *     tags: [Product Option Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option Type ID
 *     responses:
 *       200:
 *         description: Product option type deleted successfully
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
 *         description: Product option type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', productOptionTypeController.deleteProductOptionType);

export default router;