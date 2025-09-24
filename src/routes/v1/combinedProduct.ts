import { Router } from 'express';
import { CombinedProductController } from '../../controllers/CombinedProductController';
import { authenticateAdmin } from '../../middleware/adminAuth';

const router: Router = Router();
const combinedProductController = new CombinedProductController();

/**
 * @swagger
 * tags:
 *   name: Combined Product Management
 *   description: Combined product, variant, and image management
 */

/**
 * @swagger
 * /products/with-variants-and-images:
 *   post:
 *     summary: Create a product with variants and images in a single operation (admin only)
 *     tags: [Combined Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   slug:
 *                     type: string
 *                     description: Unique identifier for the product
 *                   name:
 *                     type: string
 *                     description: Product name
 *                   short_description:
 *                     type: string
 *                     description: Short description of the product
 *                   long_description:
 *                     type: string
 *                     description: Detailed description of the product
 *                   currency:
 *                     type: string
 *                     length: 3
 *                     default: USD
 *                     description: Currency code for prices
 *                   is_active:
 *                     type: boolean
 *                     default: true
 *                     description: Whether the product is active
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: number
 *                       description: Price of the variant
 *                     compareAtPrice:
 *                       type: number
 *                       description: Compare at price (original price)
 *                     stock:
 *                       type: number
 *                       description: Stock quantity
 *                     weightGram:
 *                       type: number
 *                       description: Weight in grams
 *                     isActive:
 *                       type: boolean
 *                       default: true
 *                       description: Whether the variant is active
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             format: uri
 *                             description: URL of the image (optional, use for direct URLs)
 *                           imageData:
 *                             type: string
 *                             description: Base64 encoded image data (optional, use for pasted images in format data:image/[type];base64,[data])
 *                           position:
 *                             type: integer
 *                             default: 1
 *                             description: Position of the image (1 = cover image)
 *             example:
 *               product:
 *                 slug: "premium-coffee-beans"
 *                 name: "Premium Coffee Beans"
 *                 short_description: "High-quality coffee beans sourced from the best farms"
 *                 long_description: "Our premium coffee beans are carefully selected and roasted to perfection..."
 *                 currency: "USD"
 *                 is_active: true
 *               variants:
 *                 - price: 19.99
 *                   compareAtPrice: 24.99
 *                   stock: 100
 *                   weightGram: 500
 *                   isActive: true
 *                   images:
 *                     - url: "https://example.com/image1.jpg"
 *                       position: 1
 *                     - imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA=="
 *                       position: 2
 *     responses:
 *       201:
 *         description: Product with variants and images created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         slug:
 *                           type: string
 *                         name:
 *                           type: string
 *                         short_description:
 *                           type: string
 *                         long_description:
 *                           type: string
 *                         currency:
 *                           type: string
 *                         is_active:
 *                           type: boolean
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           price:
 *                             type: number
 *                           compareAtPrice:
 *                             type: number
 *                           stock:
 *                             type: number
 *                           weightGram:
 *                             type: number
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 variantId:
 *                                   type: string
 *                                   format: uuid
 *                                 url:
 *                                   type: string
 *                                   format: uri
 *                                 position:
 *                                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/with-variants-and-images', 
  authenticateAdmin, 
  (req, res) => combinedProductController.createProductWithVariantsAndImages(req, res)
);

/**
 * @swagger
 * /products/{id}/add-variants-and-images:
 *   post:
 *     summary: Add variants and images to an existing product (admin only)
 *     tags: [Combined Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 price:
 *                   type: number
 *                   description: Price of the variant
 *                 compareAtPrice:
 *                   type: number
 *                   description: Compare at price (original price)
 *                 stock:
 *                   type: number
 *                   description: Stock quantity
 *                 weightGram:
 *                   type: number
 *                   description: Weight in grams
 *                 isActive:
 *                   type: boolean
 *                   default: true
 *                   description: Whether the variant is active
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         format: uri
 *                         description: URL of the image (optional, use for direct URLs)
 *                       imageData:
 *                         type: string
 *                         description: Base64 encoded image data (optional, use for pasted images in format data:image/[type];base64,[data])
 *                       position:
 *                         type: integer
 *                         default: 1
 *                         description: Position of the image (1 = cover image)
 *           example:
 *             - price: 15.99
 *               compareAtPrice: 19.99
 *               stock: 75
 *               weightGram: 250
 *               isActive: true
 *               images:
 *                 - url: "https://example.com/image1.jpg"
 *                   position: 1
 *                 - imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA=="
 *                   position: 2
 *     responses:
 *       201:
 *         description: Variants with images added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           price:
 *                             type: number
 *                           compareAtPrice:
 *                             type: number
 *                           stock:
 *                             type: number
 *                           weightGram:
 *                             type: number
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 variantId:
 *                                   type: string
 *                                   format: uuid
 *                                 url:
 *                                   type: string
 *                                   format: uri
 *                                 position:
 *                                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/add-variants-and-images', 
  authenticateAdmin, 
  (req, res) => combinedProductController.addVariantsWithImagesToProduct(req, res)
);

/**
 * @swagger
 * /products/{id}/with-variants-and-images:
 *   get:
 *     summary: Get a product with all its variants and images (admin only)
 *     tags: [Combined Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product with variants and images retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     slug:
 *                       type: string
 *                     name:
 *                       type: string
 *                     short_description:
 *                       type: string
 *                     long_description:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           price:
 *                             type: number
 *                           compareAtPrice:
 *                             type: number
 *                           stock:
 *                             type: number
 *                           weightGram:
 *                             type: number
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 variantId:
 *                                   type: string
 *                                   format: uuid
 *                                 url:
 *                                   type: string
 *                                   format: uri
 *                                 position:
 *                                   type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/with-variants-and-images', 
  authenticateAdmin, 
  (req, res) => combinedProductController.getProductWithVariantsAndImages(req, res)
);

/**
 * @swagger
 * /products/{id}/with-variants-and-images:
 *   put:
 *     summary: Update a product with its variants and images (admin only)
 *     tags: [Combined Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   slug:
 *                     type: string
 *                   name:
 *                     type: string
 *                   short_description:
 *                     type: string
 *                   long_description:
 *                     type: string
 *                   currency:
 *                     type: string
 *                     length: 3
 *                   is_active:
 *                     type: boolean
 *                 description: Product updates (optional)
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Existing variant ID
 *                     price:
 *                       type: number
 *                     compareAtPrice:
 *                       type: number
 *                     stock:
 *                       type: number
 *                     weightGram:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: Existing image ID (optional, if creating a new image omit this)
 *                           url:
 *                             type: string
 *                             format: uri
 *                             description: URL of the image (optional, use for direct URLs)
 *                           imageData:
 *                             type: string
 *                             description: Base64 encoded image data (optional, use for pasted images in format data:image/[type];base64,[data])
 *                           position:
 *                             type: integer
 *                             description: Position of the image (1 = cover image)
 *                 description: Variant updates (optional)
 *           example:
 *             product:
 *               name: "Updated Premium Coffee Beans"
 *               is_active: true
 *             variants:
 *               - id: "123e4567-e89b-12d3-a456-426614174001"
 *                 price: 22.99
 *                 stock: 90
 *                 images:
 *                   - id: "123e4567-e89b-12d3-a456-426614174002"
 *                     url: "https://example.com/image1.jpg"
 *                     position: 1
 *                   - imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA=="
 *                     position: 3
 *     responses:
 *       200:
 *         description: Product with variants and images updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     slug:
 *                       type: string
 *                     name:
 *                       type: string
 *                     short_description:
 *                       type: string
 *                     long_description:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           productId:
 *                             type: string
 *                             format: uuid
 *                           price:
 *                             type: number
 *                           compareAtPrice:
 *                             type: number
 *                           stock:
 *                             type: number
 *                           weightGram:
 *                             type: number
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 variantId:
 *                                   type: string
 *                                   format: uuid
 *                                 url:
 *                                   type: string
 *                                   format: uri
 *                                 position:
 *                                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product or variant not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/with-variants-and-images', 
  authenticateAdmin, 
  (req, res) => combinedProductController.updateProductWithVariantsAndImages(req, res)
);

/**
 * @swagger
 * /products/{id}/with-variants-and-images:
 *   delete:
 *     summary: Delete a product with all its variants and images (admin only)
 *     tags: [Combined Product Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product with all variants and images deleted successfully
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
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/with-variants-and-images', 
  authenticateAdmin, 
  (req, res) => combinedProductController.deleteProductWithVariantsAndImages(req, res)
);

export default router;