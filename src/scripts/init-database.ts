#!/usr/bin/env node

// This script initializes the database with sample data

import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function initializeDatabase() {
  console.log('Connecting to database...');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'beanmart',
  });

  try {
    console.log('Initializing database with sample data...');
    
    // Insert sample users
    await pool.query(`
      INSERT INTO users (email, phone, full_name) VALUES 
      ('john.doe@example.com', '+6281234567890', 'John Doe'),
      ('jane.smith@example.com', '+6281234567891', 'Jane Smith')
      ON CONFLICT (email) DO NOTHING;
    `);
    
    // Insert sample categories
    await pool.query(`
      INSERT INTO categories (slug, name) VALUES 
      ('coffee', 'Coffee'),
      ('merchandise', 'Merchandise')
      ON CONFLICT (slug) DO NOTHING;
    `);
    
    // Insert sample products
    await pool.query(`
      INSERT INTO products (slug, name, short_description, base_price, currency, is_active) VALUES 
      ('sumatra-mandheling', 'Sumatra Mandheling Coffee', 'Rich, full-bodied coffee with earthy notes', 125000, 'IDR', TRUE),
      ('ethiopian-yirgacheffe', 'Ethiopian Yirgacheffe Coffee', 'Bright, floral coffee with citrus notes', 135000, 'IDR', TRUE)
      ON CONFLICT (slug) DO NOTHING;
    `);
    
    // Insert product-category relationships
    await pool.query(`
      INSERT INTO product_categories (product_id, category_id) 
      SELECT p.id, c.id 
      FROM products p, categories c 
      WHERE p.slug = 'sumatra-mandheling' AND c.slug = 'coffee'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_categories (product_id, category_id) 
      SELECT p.id, c.id 
      FROM products p, categories c 
      WHERE p.slug = 'ethiopian-yirgacheffe' AND c.slug = 'coffee'
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert product images
    await pool.query(`
      INSERT INTO product_images (product_id, url, position) 
      SELECT id, 'https://example.com/sumatra-mandheling.jpg', 1 
      FROM products WHERE slug = 'sumatra-mandheling'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_images (product_id, url, position) 
      SELECT id, 'https://example.com/ethiopian-yirgacheffe.jpg', 1 
      FROM products WHERE slug = 'ethiopian-yirgacheffe'
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert product option types
    await pool.query(`
      INSERT INTO product_option_types (product_id, name, position) 
      SELECT id, 'Grind', 1 
      FROM products WHERE slug = 'sumatra-mandheling'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_option_types (product_id, name, position) 
      SELECT id, 'Size', 2 
      FROM products WHERE slug = 'sumatra-mandheling'
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert product options
    await pool.query(`
      INSERT INTO product_options (option_type_id, value, position) 
      SELECT id, 'Whole Bean', 1 
      FROM product_option_types WHERE name = 'Grind'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_options (option_type_id, value, position) 
      SELECT id, 'Ground', 2 
      FROM product_option_types WHERE name = 'Grind'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_options (option_type_id, value, position) 
      SELECT id, '250g', 1 
      FROM product_option_types WHERE name = 'Size'
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.query(`
      INSERT INTO product_options (option_type_id, value, position) 
      SELECT id, '500g', 2 
      FROM product_option_types WHERE name = 'Size'
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert product variants
    const productIdResult = await pool.query(
      "SELECT id FROM products WHERE slug = 'sumatra-mandheling'"
    );
    const productId = productIdResult.rows[0].id;
    
    await pool.query(`
      INSERT INTO product_variants (product_id, sku, price, stock, option1_value, option2_value) VALUES 
      ($1, 'SM-WB-250', 125000, 50, 'Whole Bean', '250g'),
      ($1, 'SM-WB-500', 145000, 30, 'Whole Bean', '500g'),
      ($1, 'SM-G-250', 125000, 40, 'Ground', '250g'),
      ($1, 'SM-G-500', 145000, 20, 'Ground', '500g')
      ON CONFLICT (sku) DO NOTHING;
    `, [productId]);
    
    console.log('✅ Database initialized with sample data!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();