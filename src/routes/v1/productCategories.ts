import { Router } from 'express';
import { ProductCategoryController } from '../../controllers/ProductCategoryController';

/**
 * @swagger
 * tags:
 *   name: Product Categories
 *   description: Product category relations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       required:
 *         - product_id
 *         - category_id
 *       properties:
 *         product_id:
 *           type: string
 *           description: The ID of the product
 *         category_id:
 *           type: string
 *           description: The ID of the category
 *       example:
 *         product_id: 550e8400-e29b-41d4-a716-446655440000
 *         category_id: 550e8400-e29b-41d4-a716-446655440001
 */

const router: Router = Router();
const productCategoryController = new ProductCategoryController();

/**
 * @swagger
 * /product-categories:
 *   post:
 *     summary: Add category to product
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - category_id
 *             properties:
 *               product_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category added to product successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *       500:
 *         description: Internal server error
 */
router.post('/', productCategoryController.addCategoryToProduct);

/**
 * @swagger
 * /product-categories/remove:
 *   post:
 *     summary: Remove category from product
 *     tags: [Product Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - category_id
 *             properties:
 *               product_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category removed from product successfully
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
 *         description: Product category relation not found
 *       500:
 *         description: Internal server error
 */
router.post('/remove', productCategoryController.removeCategoryFromProduct);

/**
 * @swagger
 * /product-categories/product/{product_id}:
 *   get:
 *     summary: Get categories for a product
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product categories
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
 *                     $ref: '#/components/schemas/ProductCategory'
 *       500:
 *         description: Internal server error
 */
router.get('/product/:product_id', productCategoryController.getCategoriesForProduct);

/**
 * @swagger
 * /product-categories/category/{category_id}:
 *   get:
 *     summary: Get products for a category
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of product categories
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
 *                     $ref: '#/components/schemas/ProductCategory'
 *       500:
 *         description: Internal server error
 */
router.get('/category/:category_id', productCategoryController.getProductsForCategory);

export default router;