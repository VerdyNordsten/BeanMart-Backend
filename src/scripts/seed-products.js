#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beanmart',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Create category if not exists
const createCategory = async (name) => {
  try {
    const slug = generateSlug(name);
    const query = `
      INSERT INTO categories (id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name
      RETURNING id
    `;
    const values = [uuidv4(), name, slug];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating category:', error.message);
    throw error;
  }
};

// Create product
const createProduct = async (productData) => {
  try {
    const productId = uuidv4();
    const slug = generateSlug(productData.name);
    
    const query = `
      INSERT INTO products (id, slug, name, short_description, long_description, currency, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        short_description = EXCLUDED.short_description,
        long_description = EXCLUDED.long_description,
        updated_at = NOW()
      RETURNING id
    `;
    
    const values = [
      productId,
      slug,
      productData.name,
      productData.shortDescription || productData.description,
      productData.longDescription || productData.description,
      productData.currency || 'USD',
      true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
};

// Create product variant
const createProductVariant = async (productId, variantData) => {
  try {
    const variantId = uuidv4();
    
    const query = `
      INSERT INTO product_variants (id, product_id, price, compare_at_price, stock, weight_gram, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;
    
    const values = [
      variantId,
      productId,
      variantData.price,
      variantData.discount || variantData.price,
      variantData.stock || 0,
      variantData.weightGram || 1000,
      true
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating product variant:', error.message);
    throw error;
  }
};

// Create variant image
const createVariantImage = async (variantId, imageUrl) => {
  try {
    const imageId = uuidv4();
    
    const query = `
      INSERT INTO variant_images (id, variant_id, url, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `;
    
    const values = [imageId, variantId, imageUrl, 1];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating variant image:', error.message);
    throw error;
  }
};

// Main seeding function
const seedProducts = async () => {
  try {
    console.log('🔄 Starting product seeding...');
    
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../beanmart_products.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const products = JSON.parse(jsonData);
    
    console.log(`📦 Found ${products.length} products to seed`);
    
    // Create a default category
    const categoryId = await createCategory('Coffee Beans');
    console.log(`📁 Created/updated category: Coffee Beans`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        console.log(`\n🔄 Processing product ${i + 1}/${products.length}: ${productData.name}`);
        
        // Create product
        const productId = await createProduct(productData);
        console.log(`  ✅ Product created: ${productId}`);
        
        // Create product variant
        const variantId = await createProductVariant(productId, productData);
        console.log(`  ✅ Variant created: ${variantId}`);
        
        // Create variant image if available
        if (productData.image) {
          await createVariantImage(variantId, productData.image);
          console.log(`  ✅ Image added: ${productData.image}`);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Error processing product: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Product seeding completed!');
    console.log(`✅ Successfully processed: ${successCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Show help
const showHelp = () => {
  console.log('🌱 Beanmart Product Seeding Script');
  console.log('==================================\n');
  console.log('Usage:');
  console.log('  node seed-products.js              Seed products from JSON file');
  console.log('  node seed-products.js --help       Show this help\n');
  console.log('This script will:');
  console.log('  • Read products from beanmart_products.json');
  console.log('  • Create products with variants and images');
  console.log('  • Skip duplicates based on slug');
  console.log('  • Create a default "Coffee Beans" category\n');
};

// Main function
const main = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }
    
    await seedProducts();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
