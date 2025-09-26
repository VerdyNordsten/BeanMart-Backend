const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beanmart',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function createTestOrder() {
  try {
    console.log('Creating test order...');
    
    // First, check if we have any users
    const users = await pool.query('SELECT id, email FROM users LIMIT 1');
    if (users.rows.length === 0) {
      console.log('No users found. Creating a test user...');
      const newUser = await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email
      `, ['test@example.com', 'hashedpassword', 'Test', 'User', '1234567890', false]);
      console.log('Created test user:', newUser.rows[0]);
    }
    
    // Get first user
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0].id;
    console.log('Using user ID:', userId);
    
    // Check if we have any products
    const products = await pool.query('SELECT id FROM products LIMIT 1');
    if (products.rows.length === 0) {
      console.log('No products found. Creating a test product...');
      const newProduct = await pool.query(`
        INSERT INTO products (name, slug, short_description, description, currency, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, ['Test Coffee', 'test-coffee', 'Test coffee description', 'Test coffee description', 'USD', true]);
      console.log('Created test product:', newProduct.rows[0]);
    }
    
    // Get first product
    const productResult = await pool.query('SELECT id FROM products LIMIT 1');
    const productId = productResult.rows[0].id;
    console.log('Using product ID:', productId);
    
    // Check if we have any product variants
    const variants = await pool.query('SELECT id FROM product_variants WHERE product_id = $1 LIMIT 1', [productId]);
    if (variants.rows.length === 0) {
      console.log('No product variants found. Creating a test variant...');
      const newVariant = await pool.query(`
        INSERT INTO product_variants (product_id, name, price, stock, weight_gram, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [productId, 'Test Variant', 25.99, 100, 250, true]);
      console.log('Created test variant:', newVariant.rows[0]);
    }
    
    // Get first variant
    const variantResult = await pool.query('SELECT id FROM product_variants WHERE product_id = $1 LIMIT 1', [productId]);
    const variantId = variantResult.rows[0].id;
    console.log('Using variant ID:', variantId);
    
    // Create test order
    const orderResult = await pool.query(`
      INSERT INTO orders (user_id, order_number, status, total_amount, shipping_cost, currency, shipping_address, billing_address, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, order_number
    `, [
      userId,
      `TEST-${Date.now()}`,
      'pending',
      25.99,
      5.00,
      'USD',
      JSON.stringify({ address: 'Test Address', city: 'Test City', country: 'Test Country' }),
      JSON.stringify({ address: 'Test Address', city: 'Test City', country: 'Test Country' }),
      'Test order'
    ]);
    
    console.log('Created test order:', orderResult.rows[0]);
    
    // Create test order item
    const orderItemResult = await pool.query(`
      INSERT INTO order_items (order_id, product_variant_id, quantity, price_per_unit, total_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [orderResult.rows[0].id, variantId, 1, 25.99, 25.99]);
    
    console.log('Created test order item:', orderItemResult.rows[0]);
    
    // Verify the order was created
    const verifyOrder = await pool.query(`
      SELECT o.*, oi.*, p.name as product_name, pv.name as variant_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
      LEFT JOIN products p ON pv.product_id = p.id
      WHERE o.id = $1
    `, [orderResult.rows[0].id]);
    
    console.log('Verification - Order with items:');
    verifyOrder.rows.forEach(row => {
      console.log(`- Order: ${row.order_number} | Product: ${row.product_name} | Variant: ${row.variant_name} | Qty: ${row.quantity} | Price: $${row.price_per_unit}`);
    });
    
  } catch (error) {
    console.error('Error creating test order:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

createTestOrder();
