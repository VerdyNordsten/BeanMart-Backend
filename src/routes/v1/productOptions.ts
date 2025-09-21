import { Router } from 'express';
import { ProductOptionController } from '../../controllers/ProductOptionController';

/**
 * @swagger
 * tags:
 *   name: Product Options
 *   description: Product option management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductOption:
 *       type: object
 *       required:
 *         - option_type_id
 *         - value
 *         - position
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product option
 *         option_type_id:
 *           type: string
 *           description: The ID of the option type
 *         value:
 *           type: string
 *           description: Option value (e.g., Small, Medium, Large)
 *         position:
 *           type: integer
 *           description: Option position
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         option_type_id: 550e8400-e29b-41d4-a716-446655440001
 *         value: Medium
 *         position: 1
 */

const router: Router = Router();
const productOptionController = new ProductOptionController();

/**
 * @swagger
 * /product-options/option-type/{option_type_id}:
 *   get:
 *     summary: Get all options for an option type
 *     tags: [Product Options]
 *     parameters:
 *       - in: path
 *         name: option_type_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Option Type ID
 *     responses:
 *       200:
 *         description: List of product options
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
 *                     $ref: '#/components/schemas/ProductOption'
 *       500:
 *         description: Internal server error
 */
router.get('/option-type/:option_type_id', productOptionController.getProductOptions);

/**
 * @swagger
 * /product-options/{id}:
 *   get:
 *     summary: Get a product option by ID
 *     tags: [Product Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option ID
 *     responses:
 *       200:
 *         description: Product option details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOption'
 *       404:
 *         description: Product option not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productOptionController.getProductOptionById);

/**
 * @swagger
 * /product-options:
 *   post:
 *     summary: Create a new product option
 *     tags: [Product Options]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - option_type_id
 *               - value
 *               - position
 *             properties:
 *               option_type_id:
 *                 type: string
 *               value:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product option created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOption'
 *       500:
 *         description: Internal server error
 */
router.post('/', productOptionController.createProductOption);

/**
 * @swagger
 * /product-options/{id}:
 *   put:
 *     summary: Update a product option
 *     tags: [Product Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product option updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductOption'
 *       404:
 *         description: Product option not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', productOptionController.updateProductOption);

/**
 * @swagger
 * /product-options/{id}:
 *   delete:
 *     summary: Delete a product option
 *     tags: [Product Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Option ID
 *     responses:
 *       200:
 *         description: Product option deleted successfully
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
 *         description: Product option not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', productOptionController.deleteProductOption);

export default router;