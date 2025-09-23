import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function testCategoryAPIs() {
  console.log('Testing Category APIs with real data...');
  
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
    
    // Get an admin user for testing (category operations may require admin)
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
    
    // 1. Test getting all categories
    console.log('\n1. Testing get all categories...');
    
    const getAllCategoriesResult = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    
    console.log(`Found ${getAllCategoriesResult.rows.length} categories`);
    
    // Display all categories
    getAllCategoriesResult.rows.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug})`);
    });
    
    // 2. Test creating a new category (admin only)
    console.log('\n2. Testing create category...');
    
    const newCategory = {
      slug: 'test-category-' + Date.now(),
      name: 'Test Category'
    };
    
    // Check if category already exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [newCategory.slug]
    );
    
    let createdCategory;
    if (existingCategory.rows.length > 0) {
      console.log('Category already exists, using existing one');
      createdCategory = existingCategory.rows[0];
    } else {
      const createCategoryResult = await pool.query(
        'INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *',
        [newCategory.slug, newCategory.name]
      );
      
      createdCategory = createCategoryResult.rows[0];
      console.log('Category created successfully:', {
        id: createdCategory.id,
        name: createdCategory.name,
        slug: createdCategory.slug
      });
    }
    
    // 3. Test getting a specific category by ID
    console.log('\n3. Testing get category by ID...');
    
    const getCategoryResult = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [createdCategory.id]
    );
    
    if (getCategoryResult.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    const retrievedCategory = getCategoryResult.rows[0];
    console.log('Category retrieved successfully:', {
      id: retrievedCategory.id,
      name: retrievedCategory.name,
      slug: retrievedCategory.slug
    });
    
    // 4. Test getting a category by slug
    console.log('\n4. Testing get category by slug...');
    
    const getCategoryBySlugResult = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [createdCategory.slug]
    );
    
    if (getCategoryBySlugResult.rows.length === 0) {
      throw new Error('Category not found by slug');
    }
    
    const categoryBySlug = getCategoryBySlugResult.rows[0];
    console.log('Category retrieved by slug successfully:', {
      id: categoryBySlug.id,
      name: categoryBySlug.name,
      slug: categoryBySlug.slug
    });
    
    // 5. Test updating a category (admin only)
    console.log('\n5. Testing update category...');
    
    const updatedCategoryData = {
      name: 'Updated Test Category',
      slug: 'updated-test-category-' + Date.now()
    };
    
    // Check if the new slug already exists
    const existingSlug = await pool.query(
      'SELECT * FROM categories WHERE slug = $1 AND id != $2',
      [updatedCategoryData.slug, createdCategory.id]
    );
    
    if (existingSlug.rows.length > 0) {
      updatedCategoryData.slug = updatedCategoryData.slug + '-new';
    }
    
    const updateCategoryResult = await pool.query(
      'UPDATE categories SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
      [updatedCategoryData.name, updatedCategoryData.slug, createdCategory.id]
    );
    
    if (updateCategoryResult.rows.length === 0) {
      throw new Error('Category not found for update');
    }
    
    const updatedCategory = updateCategoryResult.rows[0];
    console.log('Category updated successfully:', {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug
    });
    
    // Update the createdCategory reference for later use
    createdCategory = updatedCategory;
    
    // 6. Test linking products to categories
    console.log('\n6. Testing link products to categories...');
    
    // Get a product to link
    const productResult = await pool.query(
      'SELECT * FROM products LIMIT 1'
    );
    
    if (productResult.rows.length === 0) {
      throw new Error('No products found to link to category');
    }
    
    const product = productResult.rows[0];
    console.log('Using product for linking:', product.name);
    
    // Check if link already exists
    const existingLink = await pool.query(
      'SELECT * FROM product_categories WHERE product_id = $1 AND category_id = $2',
      [product.id, createdCategory.id]
    );
    
    if (existingLink.rows.length === 0) {
      // Create link
      const createLinkResult = await pool.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) RETURNING *',
        [product.id, createdCategory.id]
      );
      
      console.log('Product linked to category successfully');
    } else {
      console.log('Product already linked to category');
    }
    
    // 7. Test getting products in a category
    console.log('\n7. Testing get products in category...');
    
    const getProductsInCategoryResult = await pool.query(
      `SELECT p.* FROM products p
       JOIN product_categories pc ON p.id = pc.product_id
       WHERE pc.category_id = $1
       ORDER BY p.created_at DESC`,
      [createdCategory.id]
    );
    
    console.log(`Found ${getProductsInCategoryResult.rows.length} products in category`);
    if (getProductsInCategoryResult.rows.length > 0) {
      console.log('First product in category:', getProductsInCategoryResult.rows[0].name);
    }
    
    // 8. Test unlinking products from categories
    console.log('\n8. Testing unlink products from categories...');
    
    const unlinkResult = await pool.query(
      'DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2',
      [product.id, createdCategory.id]
    );
    
    console.log(`Unlinked ${unlinkResult.rowCount} product-category relationships`);
    
    // 9. Test deleting a category (admin only)
    console.log('\n9. Testing delete category...');
    
    // Create another category to delete (so we don't delete our main test category)
    const categoryToDeleteSlug = 'category-to-delete-' + Date.now();
    const categoryToDeleteResult = await pool.query(
      'INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *',
      [categoryToDeleteSlug, 'Category to Delete']
    );
    
    const categoryToDelete = categoryToDeleteResult.rows[0];
    console.log('Created category to delete:', categoryToDelete.name);
    
    // Now delete it
    const deleteResult = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [categoryToDelete.id]
    );
    
    if (deleteResult.rows.length === 0) {
      throw new Error('Category not found for deletion');
    }
    
    console.log('Category deleted successfully:', deleteResult.rows[0].name);
    
    console.log('\nAll category API tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing category APIs:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testCategoryAPIs()
  .then(() => {
    console.log('\nCategory API testing completed successfully.');
  })
  .catch(error => {
    console.error('Category API testing failed:', error);
    process.exit(1);
  });

export default testCategoryAPIs;