const { Client } = require('pg');
require('dotenv').config();

async function cleanDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Disable triggers temporarily to avoid constraint violations during cleanup
    await client.query('SET session_replication_role = replica;');

    // Truncate tables in reverse dependency order (child tables first)
    // This handles foreign key constraints properly
    const tables = [
      'order_items',
      'variant_images', 
      'product_categories',
      'product_variants',
      'orders',
      'user_addresses',
      'products',
      'categories',
      'admins',
      'users'
    ];

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
      console.log(`Truncated table: ${table}`);
    }

    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT;');

    console.log('Database cleaned successfully!');
    
    // Optional: Verify all tables are empty
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table};`);
      console.log(`${table} count: ${result.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  cleanDatabase();
}

module.exports = cleanDatabase;