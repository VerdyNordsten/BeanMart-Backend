import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function testAdminFunctionality() {
  console.log('Testing Admin Functionality with real data...');
  
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
    
    // 1. Test admin login and authentication
    console.log('\n1. Testing admin login and authentication...');
    
    const adminEmail = 'admin1@test.com';
    const adminPassword = 'admin1';
    
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [adminEmail]
    );
    
    if (adminResult.rows.length === 0) {
      throw new Error('Admin not found');
    }
    
    const admin = adminResult.rows[0];
    
    // Verify admin password
    const isAdminPasswordValid = await bcrypt.compare(adminPassword, admin.password_hash);
    if (!isAdminPasswordValid) {
      throw new Error('Admin password verification failed');
    }
    
    // Generate admin JWT token
    const adminToken = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin login successful');
    console.log('Admin token generated:', adminToken.substring(0, 20) + '...');
    
    // 2. Test getting admin profile
    console.log('\n2. Testing get admin profile...');
    
    const adminProfileResult = await pool.query(
      'SELECT id, email, full_name, is_active, created_at, updated_at FROM admins WHERE id = $1',
      [admin.id]
    );
    
    if (adminProfileResult.rows.length === 0) {
      throw new Error('Admin not found');
    }
    
    const adminProfile = adminProfileResult.rows[0];
    console.log('Admin profile retrieved:', {
      id: adminProfile.id,
      email: adminProfile.email,
      fullName: adminProfile.full_name,
      isActive: adminProfile.is_active,
      createdAt: adminProfile.created_at
    });
    
    // 3. Test admin-only product management
    console.log('\n3. Testing admin-only product management...');
    
    // Create a new product (admin only)
    const newProduct = {
      slug: 'admin-test-product-' + Date.now(),
      name: 'Admin Test Product',
      short_description: 'Product created by admin',
      base_price: 200000,
      base_compare_at_price: 250000,
      currency: 'IDR',
      is_active: true,
      sku: 'ATP-' + Date.now(),
      weight_gram: 750
    };
    
    const createProductResult = await pool.query(
      `INSERT INTO products 
      (slug, name, short_description, base_price, base_compare_at_price, currency, is_active, sku, weight_gram) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        newProduct.slug,
        newProduct.name,
        newProduct.short_description,
        newProduct.base_price,
        newProduct.base_compare_at_price,
        newProduct.currency,
        newProduct.is_active,
        newProduct.sku,
        newProduct.weight_gram
      ]
    );
    
    const createdProduct = createProductResult.rows[0];
    console.log('Admin created product successfully:', createdProduct.name);
    
    // Update the product (admin only)
    const updateProductResult = await pool.query(
      `UPDATE products 
      SET name = $1, base_price = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
      ['Updated Admin Test Product', 220000, createdProduct.id]
    );
    
    const updatedProduct = updateProductResult.rows[0];
    console.log('Admin updated product successfully:', updatedProduct.name);
    
    // 4. Test admin-only category management
    console.log('\n4. Testing admin-only category management...');
    
    // Create a new category (admin only)
    const newCategory = {
      slug: 'admin-test-category-' + Date.now(),
      name: 'Admin Test Category'
    };
    
    const createCategoryResult = await pool.query(
      'INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *',
      [newCategory.slug, newCategory.name]
    );
    
    const createdCategory = createCategoryResult.rows[0];
    console.log('Admin created category successfully:', createdCategory.name);
    
    // Link product to category
    await pool.query(
      'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
      [createdProduct.id, createdCategory.id]
    );
    
    console.log('Admin linked product to category successfully');
    
    // 5. Test admin-only order management
    console.log('\n5. Testing admin-only order management...');
    
    // Get a user for creating an order
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['user1@test.com']
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Test user not found');
    }
    
    const user = userResult.rows[0];
    
    // Get user address
    const addressResult = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    
    const address = addressResult.rows.length > 0 ? addressResult.rows[0] : null;
    
    // Create an order for the user
    const orderNumber = `ADMIN-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const createOrderResult = await pool.query(
      `INSERT INTO orders 
      (user_id, order_number, status, total_amount, currency, shipping_address, billing_address) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user.id,
        orderNumber,
        'pending',
        150000,
        'IDR',
        address ? JSON.stringify({
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        }) : null,
        address ? JSON.stringify({
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        }) : null
      ]
    );
    
    const createdOrder = createOrderResult.rows[0];
    console.log('Admin created order for user successfully:', createdOrder.order_number);
    
    // Update order status (admin only)
    const updateOrderResult = await pool.query(
      `UPDATE orders 
      SET status = $1, notes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
      ['confirmed', 'Order confirmed by admin', createdOrder.id]
    );
    
    const updatedOrder = updateOrderResult.rows[0];
    console.log('Admin updated order status successfully:', updatedOrder.status);
    
    // 6. Test admin management
    console.log('\n6. Testing admin management...');
    
    // Get all admins
    const getAllAdminsResult = await pool.query(
      'SELECT id, email, full_name, is_active, created_at FROM admins ORDER BY created_at DESC'
    );
    
    console.log(`Found ${getAllAdminsResult.rows.length} admins`);
    
    // Display first 3 admins
    const adminsToShow = getAllAdminsResult.rows.slice(0, 3);
    adminsToShow.forEach(admin => {
      console.log(`- ${admin.full_name} (${admin.email}): ${admin.is_active ? 'Active' : 'Inactive'}`);
    });
    
    // 7. Test creating a new admin
    console.log('\n7. Testing create new admin...');
    
    const newAdmin = {
      email: 'newadmin@test.com',
      fullName: 'New Admin',
      password: 'newadmin123'
    };
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [newAdmin.email]
    );
    
    let createdAdmin;
    if (existingAdmin.rows.length > 0) {
      console.log('Admin already exists, using existing one');
      createdAdmin = existingAdmin.rows[0];
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(newAdmin.password, 10);
      
      const createAdminResult = await pool.query(
        `INSERT INTO admins 
        (email, full_name, password_hash, is_active) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [newAdmin.email, newAdmin.fullName, hashedPassword, true]
      );
      
      createdAdmin = createAdminResult.rows[0];
      console.log('Admin created successfully:', createdAdmin.email);
    }
    
    // 8. Test updating admin status
    console.log('\n8. Testing update admin status...');
    
    const updateAdminResult = await pool.query(
      `UPDATE admins 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *`,
      [!createdAdmin.is_active, createdAdmin.id]
    );
    
    const updatedAdmin = updateAdminResult.rows[0];
    console.log('Admin status updated successfully:', {
      email: updatedAdmin.email,
      isActive: updatedAdmin.is_active
    });
    
    // 9. Test admin access to all system data
    console.log('\n9. Testing admin access to all system data...');
    
    // Get counts of all major entities
    const productsCount = await pool.query('SELECT COUNT(*) as count FROM products');
    const categoriesCount = await pool.query('SELECT COUNT(*) as count FROM categories');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');
    const addressesCount = await pool.query('SELECT COUNT(*) as count FROM user_addresses');
    
    console.log('System data summary:');
    console.log(`- Products: ${productsCount.rows[0].count}`);
    console.log(`- Categories: ${categoriesCount.rows[0].count}`);
    console.log(`- Users: ${usersCount.rows[0].count}`);
    console.log(`- Orders: ${ordersCount.rows[0].count}`);
    console.log(`- Addresses: ${addressesCount.rows[0].count}`);
    
    console.log('\nAll admin functionality tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing admin functionality:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testAdminFunctionality()
  .then(() => {
    console.log('\nAdmin functionality testing completed successfully.');
  })
  .catch(error => {
    console.error('Admin functionality testing failed:', error);
    process.exit(1);
  });

export default testAdminFunctionality;