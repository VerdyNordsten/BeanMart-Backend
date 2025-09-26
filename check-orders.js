const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beanmart',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkOrders() {
  try {
    console.log('Checking database connection...');
    
    // Check if orders table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      );
    `);
    console.log('Orders table exists:', tableCheck.rows[0].exists);
    
    // Check admin users
    const adminUsers = await pool.query('SELECT id, email, is_admin FROM users WHERE is_admin = true');
    console.log('Admin users:', adminUsers.rows);
    
    // Check total orders
    const orderCount = await pool.query('SELECT COUNT(*) FROM orders');
    console.log('Total orders in database:', orderCount.rows[0].count);
    
    // Check recent orders
    const recentOrders = await pool.query(`
      SELECT id, order_number, status, total_amount, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('Recent orders:');
    recentOrders.rows.forEach(order => {
      console.log(`- ${order.order_number}: ${order.status} - $${order.total_amount} (${order.created_at})`);
    });
    
    // Check order items
    const orderItemsCount = await pool.query('SELECT COUNT(*) FROM order_items');
    console.log('Total order items:', orderItemsCount.rows[0].count);
    
    // Check if there are any orders with items
    const ordersWithItems = await pool.query(`
      SELECT o.id, o.order_number, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, o.order_number
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    console.log('Orders with item counts:');
    ordersWithItems.rows.forEach(order => {
      console.log(`- ${order.order_number}: ${order.item_count} items`);
    });
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkOrders();
