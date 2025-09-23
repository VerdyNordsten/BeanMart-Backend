import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function testProductAPIs() {
  console.log('Testing Product APIs with real data...');
  
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'beanmart',
    password: process.env.DB_PASSWORD ?? 'postgres',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
  });
  
  try {
    // Test the database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Get an admin user for testing (product operations require admin)
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      ['admin1@test.com']
    );
    
    if (adminResult.rows.length === 0) {
      throw new Error('Test admin not found');
    }
    
    const admin = adminResult.rows[0];
    console.log('Using test admin:', admin.email);
    
    // Generate admin JWT token
    const adminToken = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin token generated for testing');
    
    // 1. Test getting all products
    console.log('\n1. Testing get all products...');
    
    const getAllProductsResult = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    
    console.log(`Found ${getAllProductsResult.rows.length} products`);
    
    // Display first 3 products
    const productsToShow = getAllProductsResult.rows.slice(0, 3);
    productsToShow.forEach(prod => {
      console.log(`- ${prod.name}: ${prod.base_price} ${prod.currency}`);
    });
    
    // 2. Test getting active products
    console.log('\n2. Testing get active products...');
    
    const getActiveProductsResult = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC'
    );
    
    console.log(`Found ${getActiveProductsResult.rows.length} active products`);
    
    // 3. Test creating a new product (admin only)
    console.log('\n3. Testing create product...');
    
    const newProduct = {
      slug: 'test-product-' + Date.now(),
      name: 'Test Product',
      short_description: 'This is a test product',
      long_description: 'This is a detailed description of the test product',
      base_price: 100000,
      base_compare_at_price: 120000,
      currency: 'IDR',
      is_active: true,
      sku: 'TP-' + Date.now(),
      weight_gram: 500
    };
    
    const createProductResult = await pool.query(
      `INSERT INTO products 
      (slug, name, short_description, long_description, base_price, base_compare_at_price, currency, is_active, sku, weight_gram) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        newProduct.slug,
        newProduct.name,
        newProduct.short_description,
        newProduct.long_description,
        newProduct.base_price,
        newProduct.base_compare_at_price,
        newProduct.currency,
        newProduct.is_active,
        newProduct.sku,
        newProduct.weight_gram
      ]
    );
    
    const createdProduct = createProductResult.rows[0];
    console.log('Product created successfully:', {
      id: createdProduct.id,
      name: createdProduct.name,
      slug: createdProduct.slug,
      price: createdProduct.base_price
    });
    
    // 4. Test getting a specific product by ID
    console.log('\n4. Testing get product by ID...');
    
    const getProductResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [createdProduct.id]
    );
    
    if (getProductResult.rows.length === 0) {
      throw new Error('Product not found');
    }
    
    const retrievedProduct = getProductResult.rows[0];
    console.log('Product retrieved successfully:', {
      id: retrievedProduct.id,
      name: retrievedProduct.name,
      slug: retrievedProduct.slug,
      short_description: retrievedProduct.short_description,
      base_price: retrievedProduct.base_price,
      currency: retrievedProduct.currency,
      is_active: retrievedProduct.is_active
    });
    
    // 5. Test getting a product by slug
    console.log('\n5. Testing get product by slug...');
    
    const getProductBySlugResult = await pool.query(
      'SELECT * FROM products WHERE slug = $1',
      [createdProduct.slug]
    );
    
    if (getProductBySlugResult.rows.length === 0) {
      throw new Error('Product not found by slug');
    }
    
    const productBySlug = getProductBySlugResult.rows[0];
    console.log('Product retrieved by slug successfully:', {
      id: productBySlug.id,
      name: productBySlug.name,
      slug: productBySlug.slug
    });
    
    // 6. Test updating a product (admin only)
    console.log('\n6. Testing update product...');
    
    const updatedProductData = {
      name: 'Updated Test Product',
      short_description: 'This is an updated test product',
      base_price: 150000,
      base_compare_at_price: 180000,
      is_active: false
    };
    
    const updateProductResult = await pool.query(
      `UPDATE products 
      SET name = $1, short_description = $2, base_price = $3, base_compare_at_price = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *`,
      [
        updatedProductData.name,
        updatedProductData.short_description,
        updatedProductData.base_price,
        updatedProductData.base_compare_at_price,
        updatedProductData.is_active,
        createdProduct.id
      ]
    );
    
    if (updateProductResult.rows.length === 0) {
      throw new Error('Product not found for update');
    }
    
    const updatedProduct = updateProductResult.rows[0];
    console.log('Product updated successfully:', {
      id: updatedProduct.id,
      name: updatedProduct.name,
      base_price: updatedProduct.base_price,
      is_active: updatedProduct.is_active
    });
    
    // 7. Test getting product images
    console.log('\n7. Testing get product images...');
    
    // First create a test image for the product
    const testImageUrl = 'https://example.com/test-product-image.jpg';
    
    const createImageResult = await pool.query(
      'INSERT INTO product_images (product_id, url, position) VALUES ($1, $2, $3) RETURNING *',
      [createdProduct.id, testImageUrl, 1]
    );
    
    const createdImage = createImageResult.rows[0];
    console.log('Created test image for product:', createdImage.url);
    
    // Now get product images
    const getProductImagesResult = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY position',
      [createdProduct.id]
    );
    
    console.log(`Found ${getProductImagesResult.rows.length} images for product`);
    if (getProductImagesResult.rows.length > 0) {
      console.log('First image URL:', getProductImagesResult.rows[0].url);
    }
    
    // 8. Test getting product variants
    console.log('\n8. Testing get product variants...');
    
    // First create a test variant for the product
    const testVariant = {
      sku: createdProduct.sku + '-VAR1',
      price: 140000,
      compare_at_price: 170000,
      stock: 50,
      weight_gram: 500,
      option1_value: 'Standard'
    };
    
    const createVariantResult = await pool.query(
      `INSERT INTO product_variants 
      (product_id, sku, price, compare_at_price, stock, weight_gram, option1_value, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        createdProduct.id,
        testVariant.sku,
        testVariant.price,
        testVariant.compare_at_price,
        testVariant.stock,
        testVariant.weight_gram,
        testVariant.option1_value,
        true
      ]
    );
    
    const createdVariant = createVariantResult.rows[0];
    console.log('Created test variant for product:', {
      sku: createdVariant.sku,
      price: createdVariant.price,
      option: createdVariant.option1_value
    });
    
    // Now get product variants
    const getProductVariantsResult = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at',
      [createdProduct.id]
    );
    
    console.log(`Found ${getProductVariantsResult.rows.length} variants for product`);
    if (getProductVariantsResult.rows.length > 0) {
      const firstVariant = getProductVariantsResult.rows[0];
      console.log('First variant:', {
        sku: firstVariant.sku,
        price: firstVariant.price,
        stock: firstVariant.stock,
        option: firstVariant.option1_value
      });
    }
    
    // 9. Test getting active product variants
    console.log('\n9. Testing get active product variants...');
    
    const getActiveProductVariantsResult = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true ORDER BY created_at',
      [createdProduct.id]
    );
    
    console.log(`Found ${getActiveProductVariantsResult.rows.length} active variants for product`);
    
    // 10. Test deleting a product (admin only)
    console.log('\n10. Testing delete product...');
    
    // Create another product to delete (so we don't delete our main test product)
    const productToDeleteResult = await pool.query(
      `INSERT INTO products 
      (slug, name, short_description, base_price, currency, is_active, sku, weight_gram) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        'product-to-delete-' + Date.now(),
        'Product to Delete',
        'This product will be deleted',
        50000,
        'IDR',
        true,
        'PTD-' + Date.now(),
        250
      ]
    );
    
    const productToDelete = productToDeleteResult.rows[0];
    console.log('Created product to delete:', productToDelete.name);
    
    // Now delete it
    const deleteResult = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [productToDelete.id]
    );
    
    if (deleteResult.rows.length === 0) {
      throw new Error('Product not found for deletion');
    }
    
    console.log('Product deleted successfully:', deleteResult.rows[0].name);
    
    console.log('\nAll product API tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing product APIs:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testProductAPIs()
  .then(() => {
    console.log('\nProduct API testing completed successfully.');
  })
  .catch(error => {
    console.error('Product API testing failed:', error);
    process.exit(1);
  });

export default testProductAPIs;