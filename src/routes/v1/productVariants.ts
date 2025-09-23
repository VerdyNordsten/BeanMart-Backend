import { Router } from 'express';
import { ProductVariantController } from '../../controllers/ProductVariantController';

/**
 * @swagger
 * tags:
 *   name: Product Variants
 *   description: Product variant management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductVariant:
 *       type: object
 *       required:
 *         - product_id
 *         - price
 *         - stock
 *         - is_active
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product variant
 *         product_id:
 *           type: string
 *           description: The ID of the product
 *         sku:
 *           type: string
 *           description: Unique SKU for the variant
 *         price:
 *           type: number
 *           format: float
 *           description: Variant price
 *         compare_at_price:
 *           type: number
 *           format: float
 *           description: Compare at price (original price)
 *         stock:
 *           type: integer
 *           description: Available stock
 *         weight_gram:
 *           type: integer
 *           description: Weight in grams
 *         option1_value:
 *           type: string
 *           description: Value for first option
 *         option2_value:
 *           type: string
 *           description: Value for second option
 *         option3_value:
 *           type: string
 *           description: Value for third option
 *         is_active:
 *           type: boolean
 *           description: Whether the variant is active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Variant creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Variant last update timestamp
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         product_id: 550e8400-e29b-41d4-a716-446655440001
 *         sku: CB-MED-250
 *         price: 125000
 *         compare_at_price: 150000
 *         stock: 50
 *         weight_gram: 250
 *         option1_value: Medium
 *         option2_value: 250g
 *         option3_value: Whole Bean
 *         is_active: true
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 */

const router: Router = Router();
const productVariantController = new ProductVariantController();

/**
 * @swagger
 * /product-variants/product/{product_id}:
 *   get:
 *     summary: Get all variants for a product
 *     tags: [Product Variants]
 *     security: []  # No authentication required
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product variants
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
 *                     $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/product/:product_id', productVariantController.getProductVariants);

/**
 * @swagger
 * /product-variants/product/{product_id}/active:
 *   get:
 *     summary: Get active variants for a product
 *     tags: [Product Variants]
 *     security: []  # No authentication required
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of active product variants
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
 *                     $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/product/:product_id/active', productVariantController.getActiveProductVariants);

/**
 * @swagger
 * /product-variants/{id}:
 *   get:
 *     summary: Get a product variant by ID
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Variant ID
 *     responses:
 *       200:
 *         description: Product variant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productVariantController.getProductVariantById);

/**
 * @swagger
 * /product-variants/sku/{sku}:
 *   get:
 *     summary: Get a product variant by SKU
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: sku
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Variant SKU
 *     responses:
 *       200:
 *         description: Product variant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Internal server error
 */
router.get('/sku/:sku', productVariantController.getProductVariantBySku);

/**
 * @swagger
 * /product-variants:
 *   post:
 *     summary: Create a new product variant
 *     tags: [Product Variants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - price
 *               - stock
 *               - is_active
 *             properties:
 *               product_id:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               compare_at_price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               weight_gram:
 *                 type: integer
 *               option1_value:
 *                 type: string
 *               option2_value:
 *                 type: string
 *               option3_value:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product variant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       500:
 *         description: Internal server error
 */
router.post('/', productVariantController.createProductVariant);

/**
 * @swagger
 * /product-variants/{id}:
 *   put:
 *     summary: Update a product variant
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               compare_at_price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               weight_gram:
 *                 type: integer
 *               option1_value:
 *                 type: string
 *               option2_value:
 *                 type: string
 *               option3_value:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product variant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product variant not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', productVariantController.updateProductVariant);

/**
 * @swagger
 * /product-variants/{id}:
 *   delete:
 *     summary: Delete a product variant
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Variant ID
 *     responses:
 *       200:
 *         description: Product variant deleted successfully
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
 *         description: Product variant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', productVariantController.deleteProductVariant);

export default router;