import { Router } from 'express';
import { ProductImageController } from '../../controllers/ProductImageController';

/**
 * @swagger
 * tags:
 *   name: Product Images
 *   description: Product image management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductImage:
 *       type: object
 *       required:
 *         - product_id
 *         - url
 *         - position
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product image
 *         product_id:
 *           type: string
 *           description: The ID of the product
 *         url:
 *           type: string
 *           description: Image URL
 *         position:
 *           type: integer
 *           description: Image position (1 = cover image)
 *       example:
 *         id: 550e8400-e29b-41d4-a716-446655440000
 *         product_id: 550e8400-e29b-41d4-a716-446655440001
 *         url: https://example.com/image.jpg
 *         position: 1
 */

const router: Router = Router();
const productImageController = new ProductImageController();

/**
 * @swagger
 * /product-images/product/{product_id}:
 *   get:
 *     summary: Get all images for a product
 *     tags: [Product Images]
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
 *         description: List of product images
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
 *                     $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/product/:product_id', productImageController.getProductImages);

/**
 * @swagger
 * /product-images/{id}:
 *   get:
 *     summary: Get a product image by ID
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Image ID
 *     responses:
 *       200:
 *         description: Product image details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product image not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', productImageController.getProductImageById);

/**
 * @swagger
 * /product-images:
 *   post:
 *     summary: Create a new product image
 *     tags: [Product Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - url
 *               - position
 *             properties:
 *               product_id:
 *                 type: string
 *               url:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product image created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *       500:
 *         description: Internal server error
 */
router.post('/', productImageController.createProductImage);

/**
 * @swagger
 * /product-images/{id}:
 *   put:
 *     summary: Update a product image
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product image not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', productImageController.updateProductImage);

/**
 * @swagger
 * /product-images/{id}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Image ID
 *     responses:
 *       200:
 *         description: Product image deleted successfully
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
 *         description: Product image not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', productImageController.deleteProductImage);

/**
 * @swagger
 * /product-images/{id}/position:
 *   put:
 *     summary: Update product image position
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *             properties:
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product image position updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductImage'
 *       404:
 *         description: Product image not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/position', productImageController.updateImagePosition);

export default router;