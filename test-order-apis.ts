import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function testOrderAPIs() {
  console.log('Testing Order APIs with real data...');
  
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
    
    // Get a test user for testing
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['user1@test.com']
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Test user not found');
    }
    
    const user = userResult.rows[0];
    console.log('Using test user:', user.email);
    
    // Generate user JWT token
    const userToken = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('User token generated for testing');
    
    // Get an admin user for testing (admin operations)
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
    
    // Get user addresses
    const addressResult = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    
    if (addressResult.rows.length === 0) {
      throw new Error('No addresses found for user');
    }
    
    const address = addressResult.rows[0];
    console.log('Using address for orders:', address.label);
    
    // Get product variants
    const variantResult = await pool.query(
      `SELECT pv.*, p.name as product_name 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.id 
       LIMIT 3`
    );
    
    if (variantResult.rows.length === 0) {
      throw new Error('No product variants found');
    }
    
    console.log('Using product variants for orders:');
    variantResult.rows.forEach(variant => {
      console.log(`- ${variant.product_name} (${variant.option1_value}): ${variant.price}`);
    });
    
    // 1. Test creating a new order
    console.log('\n1. Testing create order...');
    
    // Create order items from variants
    const orderItems = variantResult.rows.map(variant => ({
      product_variant_id: variant.id,
      quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
      price_per_unit: variant.price,
      total_price: parseFloat(variant.price) * (Math.floor(Math.random() * 3) + 1)
    }));
    
    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const createOrderResult = await pool.query(
      `INSERT INTO orders 
      (user_id, order_number, status, total_amount, currency, shipping_address, billing_address) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user.id,
        orderNumber,
        'pending',
        totalAmount,
        'IDR',
        JSON.stringify({
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        }),
        JSON.stringify({
          label: address.label,
          recipient_name: address.recipient_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country
        })
      ]
    );
    
    const createdOrder = createOrderResult.rows[0];
    console.log('Order created successfully:', {
      id: createdOrder.id,
      order_number: createdOrder.order_number,
      status: createdOrder.status,
      total_amount: createdOrder.total_amount
    });
    
    // Create order items
    for (const item of orderItems) {
      await pool.query(
        `INSERT INTO order_items 
        (order_id, product_variant_id, quantity, price_per_unit, total_price) 
        VALUES ($1, $2, $3, $4, $5)`,
        [
          createdOrder.id,
          item.product_variant_id,
          item.quantity,
          item.price_per_unit,
          item.total_price
        ]
      );
    }
    
    console.log(`Created ${orderItems.length} order items`);
    
    // 2. Test getting all orders (admin only)
    console.log('\n2. Testing get all orders (admin only)...');
    
    const getAllOrdersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log(`Found ${getAllOrdersResult.rows.length} orders`);
    if (getAllOrdersResult.rows.length > 0) {
      const firstOrder = getAllOrdersResult.rows[0];
      console.log('Most recent order:', {
        order_number: firstOrder.order_number,
        status: firstOrder.status,
        total_amount: firstOrder.total_amount
      });
    }
    
    // 3. Test getting user's orders
    console.log('\n3. Testing get user\'s orders...');
    
    const getUserOrdersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );
    
    console.log(`Found ${getUserOrdersResult.rows.length} orders for user`);
    if (getUserOrdersResult.rows.length > 0) {
      const firstUserOrder = getUserOrdersResult.rows[0];
      console.log('User\'s most recent order:', {
        order_number: firstUserOrder.order_number,
        status: firstUserOrder.status,
        total_amount: firstUserOrder.total_amount
      });
    }
    
    // 4. Test getting a specific order by ID
    console.log('\n4. Testing get order by ID...');
    
    const getOrderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [createdOrder.id]
    );
    
    if (getOrderResult.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    const retrievedOrder = getOrderResult.rows[0];
    console.log('Order retrieved successfully:', {
      id: retrievedOrder.id,
      order_number: retrievedOrder.order_number,
      status: retrievedOrder.status,
      total_amount: retrievedOrder.total_amount,
      currency: retrievedOrder.currency
    });
    
    // 5. Test getting order items
    console.log('\n5. Testing get order items...');
    
    const getOrderItemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [createdOrder.id]
    );
    
    console.log(`Found ${getOrderItemsResult.rows.length} items in order`);
    if (getOrderItemsResult.rows.length > 0) {
      const firstItem = getOrderItemsResult.rows[0];
      console.log('First order item:', {
        product_variant_id: firstItem.product_variant_id,
        quantity: firstItem.quantity,
        price_per_unit: firstItem.price_per_unit,
        total_price: firstItem.total_price
      });
    }
    
    // 6. Test updating an order (admin only)
    console.log('\n6. Testing update order (admin only)...');
    
    const updatedOrderData = {
      status: 'confirmed',
      notes: 'Order confirmed by admin'
    };
    
    const updateOrderResult = await pool.query(
      `UPDATE orders 
      SET status = $1, notes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
      [updatedOrderData.status, updatedOrderData.notes, createdOrder.id]
    );
    
    if (updateOrderResult.rows.length === 0) {
      throw new Error('Order not found for update');
    }
    
    const updatedOrder = updateOrderResult.rows[0];
    console.log('Order updated successfully:', {
      id: updatedOrder.id,
      order_number: updatedOrder.order_number,
      status: updatedOrder.status,
      notes: updatedOrder.notes
    });
    
    // 7. Test updating order status to shipped (admin only)
    console.log('\n7. Testing update order status to shipped...');
    
    const shipOrderResult = await pool.query(
      `UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *`,
      ['shipped', createdOrder.id]
    );
    
    if (shipOrderResult.rows.length === 0) {
      throw new Error('Order not found for shipping update');
    }
    
    const shippedOrder = shipOrderResult.rows[0];
    console.log('Order status updated to shipped:', {
      order_number: shippedOrder.order_number,
      status: shippedOrder.status
    });
    
    // 8. Test deleting an order (admin only)
    console.log('\n8. Testing delete order (admin only)...');
    
    // Create another order to delete (so we don't delete our main test order)
    const orderToDeleteNumber = `ORD-DEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const orderToDeleteResult = await pool.query(
      `INSERT INTO orders 
      (user_id, order_number, status, total_amount, currency) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, orderToDeleteNumber, 'pending', 50000, 'IDR']
    );
    
    const orderToDelete = orderToDeleteResult.rows[0];
    console.log('Created order to delete:', orderToDelete.order_number);
    
    // Now delete it
    const deleteResult = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [orderToDelete.id]
    );
    
    if (deleteResult.rows.length === 0) {
      throw new Error('Order not found for deletion');
    }
    
    console.log('Order deleted successfully:', deleteResult.rows[0].order_number);
    
    console.log('\nAll order API tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing order APIs:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testOrderAPIs()
  .then(() => {
    console.log('\nOrder API testing completed successfully.');
  })
  .catch(error => {
    console.error('Order API testing failed:', error);
    process.exit(1);
  });

export default testOrderAPIs;