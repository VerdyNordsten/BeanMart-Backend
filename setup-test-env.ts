import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Load environment variables
config();

async function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
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
    
    // Create test admin user
    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin already exists
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1', 
      [adminEmail]
    );
    
    if (adminResult.rows.length === 0) {
      // Create admin user
      await pool.query(
        'INSERT INTO admins (email, full_name, password_hash, is_active) VALUES ($1, $2, $3, $4)',
        [adminEmail, 'Test Admin', hashedPassword, true]
      );
      console.log('Test admin user created');
    } else {
      console.log('Test admin user already exists');
    }
    
    // Create test category
    const categorySlug = 'coffee';
    const categoryName = 'Coffee';
    
    // Check if category already exists
    const categoryResult = await pool.query(
      'SELECT * FROM categories WHERE slug = $1',
      [categorySlug]
    );
    
    if (categoryResult.rows.length === 0) {
      // Create category
      await pool.query(
        'INSERT INTO categories (slug, name) VALUES ($1, $2)',
        [categorySlug, categoryName]
      );
      console.log('Test category created');
    } else {
      console.log('Test category already exists');
    }
    
    console.log('Test environment setup complete');
    await pool.end();
  } catch (error) {
    console.error('Error setting up test environment:', error);
    await pool.end();
    process.exit(1);
  }
}

setupTestEnvironment();