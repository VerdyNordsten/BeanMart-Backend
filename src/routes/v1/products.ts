import { Router } from 'express';
import { ProductController } from '../../controllers/ProductController';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - slug
 *         - name
 *         - currency
 *         - is_active
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         slug:
 *           type: string
 *           description: Unique slug for the product
 *         name:
 *           type: string
 *           description: Product name
 *         short_description:
 *           type: string
 *           description: Short product description
 *         long_description:
 *           type: string
 *           description: Long product description
 *         source_url:
 *           type: string
 *           description: Source URL of the product
 *         base_price:
 *           type: number
 *           format: float
 *           description: Base price of the product
 *         base_compare_at_price:
 *           type: number
 *           format: float
 *           description: Base compare at price (original price)
 *         currency:
 *           type: string
 *           description: Currency code (e.g., IDR)
 *         is_active:
 *           type: boolean
 *           description: Whether the product is active
 *         sku:
 *           type: string
 *           description: Product SKU
 *         weight_gram:
 *           type: integer
 *           description: Product weight in grams
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Product last update timestamp
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         slug: coffee-beans
 *         name: Coffee Beans
 *         short_description: Premium quality coffee beans
 *         base_price: 125000
 *         currency: IDR
 *         is_active: true
 *         weight_gram: 1000
 *         created_at: 2023-01-01T00:00:00.000Z
 *         updated_at: 2023-01-01T00:00:00.000Z
 */

const router: Router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
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
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /products/active:
 *   get:
 *     summary: Get active products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of active products
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
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get('/active', productController.getActiveProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get a product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - name
 *               - currency
 *               - is_active
 *             properties:
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *               short_description:
 *                 type: string
 *               long_description:
 *                 type: string
 *               source_url:
 *                 type: string
 *               base_price:
 *                 type: number
 *                 format: float
 *               base_compare_at_price:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sku:
 *                 type: string
 *               weight_gram:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.post('/', productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               slug:
 *                 type: string
 *               name:
 *                 type: string
 *               short_description:
 *                 type: string
 *               long_description:
 *                 type: string
 *               source_url:
 *                 type: string
 *               base_price:
 *                 type: number
 *                 format: float
 *               base_compare_at_price:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sku:
 *                 type: string
 *               weight_gram:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', productController.deleteProduct);

export default router;