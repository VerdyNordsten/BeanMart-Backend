import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function populateDatabase() {
  console.log('Populating database with test data...');
  
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
    
    // 1. Create test users
    console.log('\n1. Creating test users...');
    const users = [];
    const userPasswords = [];
    
    for (let i = 1; i <= 5; i++) {
      const email = `user${i}@test.com`;
      const password = `password${i}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      userPasswords.push(password);
      
      const userResult = await pool.query(
        'INSERT INTO users (email, phone, full_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
        [`user${i}@test.com`, `+628123456789${i}`, `User ${i}`, hashedPassword]
      );
      
      users.push(userResult.rows[0]);
      console.log(`Created user: ${email}`);
    }
    
    // 2. Create test admins
    console.log('\n2. Creating test admins...');
    const admins = [];
    const adminPasswords = [];
    
    // Create additional admin users
    for (let i = 1; i <= 3; i++) {
      const email = `admin${i}@test.com`;
      const password = `admin${i}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      adminPasswords.push(password);
      
      // Check if admin already exists
      const existingAdmin = await pool.query(
        'SELECT * FROM admins WHERE email = $1',
        [email]
      );
      
      if (existingAdmin.rows.length === 0) {
        const adminResult = await pool.query(
          'INSERT INTO admins (email, full_name, password_hash, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
          [email, `Admin ${i}`, hashedPassword, true]
        );
        
        admins.push(adminResult.rows[0]);
        console.log(`Created admin: ${email}`);
      } else {
        admins.push(existingAdmin.rows[0]);
        console.log(`Admin already exists: ${email}`);
      }
    }
    
    // 3. Create user addresses
    console.log('\n3. Creating user addresses...');
    const addresses = [];
    
    for (const user of users) {
      // Create 2-3 addresses per user
      const addressCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
      
      for (let i = 1; i <= addressCount; i++) {
        const isDefault = i === 1; // First address is default
        
        const addressResult = await pool.query(
          `INSERT INTO user_addresses 
          (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            user.id,
            i === 1 ? 'Home' : i === 2 ? 'Office' : 'Other',
            `${user.full_name} ${i}`,
            user.phone,
            `Street ${i}`,
            `Apartment ${i}`,
            'Jakarta',
            'DKI Jakarta',
            `1234${i}`,
            'ID',
            isDefault
          ]
        );
        
        addresses.push(addressResult.rows[0]);
      }
      
      console.log(`Created ${addressCount} addresses for user ${user.email}`);
    }
    
    // 4. Create categories
    console.log('\n4. Creating categories...');
    const categories = [];
    const categoryData = [
      { slug: 'coffee-beans', name: 'Coffee Beans' },
      { slug: 'ground-coffee', name: 'Ground Coffee' },
      { slug: 'coffee-equipment', name: 'Coffee Equipment' },
      { slug: 'merchandise', name: 'Merchandise' },
      { slug: 'accessories', name: 'Accessories' }
    ];
    
    for (const cat of categoryData) {
      // Check if category already exists
      const existingCategory = await pool.query(
        'SELECT * FROM categories WHERE slug = $1',
        [cat.slug]
      );
      
      if (existingCategory.rows.length === 0) {
        const categoryResult = await pool.query(
          'INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *',
          [cat.slug, cat.name]
        );
        
        categories.push(categoryResult.rows[0]);
        console.log(`Created category: ${cat.name}`);
      } else {
        categories.push(existingCategory.rows[0]);
        console.log(`Category already exists: ${cat.name}`);
      }
    }
    
    // 5. Create products
    console.log('\n5. Creating products...');
    const products = [];
    const productData = [
      {
        slug: 'arabica-coffee-beans',
        name: 'Arabica Coffee Beans',
        short_description: 'Premium quality Arabica coffee beans',
        long_description: 'Our premium Arabica coffee beans are sourced from the finest plantations. These beans offer a smooth, well-balanced flavor with subtle fruity and floral notes.',
        base_price: 125000,
        base_compare_at_price: 150000,
        currency: 'IDR',
        is_active: true,
        sku: 'ACB-001',
        weight_gram: 1000
      },
      {
        slug: 'robusta-coffee-beans',
        name: 'Robusta Coffee Beans',
        short_description: 'Strong and bold Robusta coffee beans',
        long_description: 'Our Robusta coffee beans are known for their strong, bold flavor and higher caffeine content. Perfect for those who prefer a more intense coffee experience.',
        base_price: 95000,
        base_compare_at_price: 110000,
        currency: 'IDR',
        is_active: true,
        sku: 'RCB-001',
        weight_gram: 1000
      },
      {
        slug: 'ground-coffee-medium-roast',
        name: 'Ground Coffee - Medium Roast',
        short_description: 'Freshly ground medium roast coffee',
        long_description: 'Our medium roast ground coffee offers a perfect balance of flavor and aroma. Pre-ground for your convenience, ensuring you get the best taste every time.',
        base_price: 85000,
        base_compare_at_price: 95000,
        currency: 'IDR',
        is_active: true,
        sku: 'GCM-001',
        weight_gram: 500
      },
      {
        slug: 'coffee-grinder',
        name: 'Electric Coffee Grinder',
        short_description: 'Precision electric coffee grinder',
        long_description: 'This electric coffee grinder features precision grinding settings for the perfect grind size every time. With multiple settings for different brewing methods.',
        base_price: 450000,
        base_compare_at_price: 550000,
        currency: 'IDR',
        is_active: true,
        sku: 'ECG-001',
        weight_gram: 2000
      },
      {
        slug: 'coffee-mug',
        name: 'Ceramic Coffee Mug',
        short_description: 'Elegant ceramic coffee mug',
        long_description: 'This elegant ceramic coffee mug is perfect for enjoying your favorite brew. Made from high-quality ceramic with a comfortable handle.',
        base_price: 75000,
        base_compare_at_price: 90000,
        currency: 'IDR',
        is_active: true,
        sku: 'CCM-001',
        weight_gram: 350
      }
    ];
    
    for (const prod of productData) {
      // Check if product already exists
      const existingProduct = await pool.query(
        'SELECT * FROM products WHERE slug = $1',
        [prod.slug]
      );
      
      if (existingProduct.rows.length === 0) {
        const productResult = await pool.query(
          `INSERT INTO products 
          (slug, name, short_description, long_description, base_price, base_compare_at_price, currency, is_active, sku, weight_gram) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            prod.slug,
            prod.name,
            prod.short_description,
            prod.long_description,
            prod.base_price,
            prod.base_compare_at_price,
            prod.currency,
            prod.is_active,
            prod.sku,
            prod.weight_gram
          ]
        );
        
        products.push(productResult.rows[0]);
        console.log(`Created product: ${prod.name}`);
      } else {
        products.push(existingProduct.rows[0]);
        console.log(`Product already exists: ${prod.name}`);
      }
    }
    
    // 6. Link products to categories (product_categories)
    console.log('\n6. Linking products to categories...');
    const productCategories = [];
    
    for (const product of products) {
      // Link each product to 1-2 random categories
      const categoryCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
      const selectedCategories: any[] = [];
      
      while (selectedCategories.length < categoryCount && selectedCategories.length < categories.length) {
        const randomIndex = Math.floor(Math.random() * categories.length);
        const category = categories[randomIndex];
        
        // Check if not already selected
        if (!selectedCategories.some(c => c.id === category.id)) {
          selectedCategories.push(category);
          
          // Check if link already exists
          const existingLink = await pool.query(
            'SELECT * FROM product_categories WHERE product_id = $1 AND category_id = $2',
            [product.id, category.id]
          );
          
          if (existingLink.rows.length === 0) {
            const linkResult = await pool.query(
              'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) RETURNING *',
              [product.id, category.id]
            );
            
            productCategories.push(linkResult.rows[0]);
            console.log(`Linked product ${product.name} to category ${category.name}`);
          } else {
            productCategories.push(existingLink.rows[0]);
            console.log(`Product ${product.name} already linked to category ${category.name}`);
          }
        }
      }
    }
    
    // 7. Create product variants
    console.log('\n7. Creating product variants...');
    const productVariants = [];
    
    for (const product of products) {
      // Create 1-3 variants per product
      const variantCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      
      for (let i = 1; i <= variantCount; i++) {
        let variantData;
        
        if (product.name.includes('Beans')) {
          // Coffee beans variants
          const options = ['250g', '500g', '1000g'];
          const option = options[Math.min(i-1, options.length-1)];
          
          variantData = {
            sku: `${product.sku}-VAR-${i}`,
            price: product.base_price * (i * 0.5),
            compare_at_price: product.base_compare_at_price * (i * 0.5),
            stock: Math.floor(Math.random() * 100) + 20,
            weight_gram: product.weight_gram * (i * 0.5),
            option1_value: option
          };
        } else if (product.name.includes('Ground')) {
          // Ground coffee variants
          const options = ['Fine', 'Medium', 'Coarse'];
          const option = options[Math.min(i-1, options.length-1)];
          
          variantData = {
            sku: `${product.sku}-VAR-${i}`,
            price: product.base_price,
            compare_at_price: product.base_compare_at_price,
            stock: Math.floor(Math.random() * 100) + 20,
            weight_gram: product.weight_gram,
            option1_value: option
          };
        } else {
          // Other product variants
          const options = ['Small', 'Medium', 'Large'];
          const option = options[Math.min(i-1, options.length-1)];
          
          variantData = {
            sku: `${product.sku}-VAR-${i}`,
            price: product.base_price * (0.8 + (i * 0.2)),
            compare_at_price: product.base_compare_at_price * (0.8 + (i * 0.2)),
            stock: Math.floor(Math.random() * 50) + 10,
            weight_gram: product.weight_gram,
            option1_value: option
          };
        }
        
        const variantResult = await pool.query(
          `INSERT INTO product_variants 
          (product_id, sku, price, compare_at_price, stock, weight_gram, option1_value, is_active) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            product.id,
            variantData.sku,
            variantData.price,
            variantData.compare_at_price,
            variantData.stock,
            variantData.weight_gram,
            variantData.option1_value,
            true
          ]
        );
        
        productVariants.push(variantResult.rows[0]);
        console.log(`Created variant for ${product.name}: ${variantData.option1_value}`);
      }
    }
    
    // 8. Create orders
    console.log('\n8. Creating orders...');
    const orders = [];
    
    // Create 2-3 orders per user
    for (const user of users) {
      const orderCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
      
      for (let i = 1; i <= orderCount; i++) {
        // Select random address for shipping
        const userAddresses = addresses.filter(addr => addr.user_id === user.id);
        const shippingAddress = userAddresses.length > 0 
          ? userAddresses[Math.floor(Math.random() * userAddresses.length)] 
          : null;
        
        // Select random variants to order
        const orderItems = [];
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
        let totalAmount = 0;
        
        for (let j = 0; j < itemCount; j++) {
          const randomVariant = productVariants[Math.floor(Math.random() * productVariants.length)];
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
          const pricePerUnit = randomVariant.price;
          const totalPrice = pricePerUnit * quantity;
          
          orderItems.push({
            product_variant_id: randomVariant.id,
            quantity,
            price_per_unit: pricePerUnit,
            total_price: totalPrice
          });
          
          totalAmount += totalPrice;
        }
        
        // Create order
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        const orderResult = await pool.query(
          `INSERT INTO orders 
          (user_id, order_number, status, total_amount, currency, shipping_address, billing_address) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            user.id,
            orderNumber,
            status,
            totalAmount,
            'IDR',
            shippingAddress ? JSON.stringify({
              label: shippingAddress.label,
              recipient_name: shippingAddress.recipient_name,
              phone: shippingAddress.phone,
              address_line1: shippingAddress.address_line1,
              address_line2: shippingAddress.address_line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country
            }) : null,
            shippingAddress ? JSON.stringify({
              label: shippingAddress.label,
              recipient_name: shippingAddress.recipient_name,
              phone: shippingAddress.phone,
              address_line1: shippingAddress.address_line1,
              address_line2: shippingAddress.address_line2,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country
            }) : null
          ]
        );
        
        const order = orderResult.rows[0];
        orders.push(order);
        
        // Create order items
        for (const item of orderItems) {
          await pool.query(
            `INSERT INTO order_items 
            (order_id, product_variant_id, quantity, price_per_unit, total_price) 
            VALUES ($1, $2, $3, $4, $5)`,
            [
              order.id,
              item.product_variant_id,
              item.quantity,
              item.price_per_unit,
              item.total_price
            ]
          );
        }
        
        console.log(`Created order #${orderNumber} for user ${user.email} with ${orderItems.length} items`);
      }
    }
    
    console.log('\nDatabase population completed successfully!');
    console.log(`- Created ${users.length} users`);
    console.log(`- Created ${admins.length} admins`);
    console.log(`- Created ${addresses.length} user addresses`);
    console.log(`- Created ${categories.length} categories`);
    console.log(`- Created ${products.length} products`);
    console.log(`- Created ${productVariants.length} product variants`);
    console.log(`- Created ${orders.length} orders`);
    
    await pool.end();
    
    // Return data for testing
    return {
      users,
      userPasswords,
      admins,
      adminPasswords,
      addresses,
      categories,
      products,
      productVariants,
      orders
    };
  } catch (error) {
    console.error('Error populating database:', error);
    await pool.end();
    throw error;
  }
}

// Run the population script
populateDatabase()
  .then(data => {
    console.log('\nDatabase populated successfully with test data.');
  })
  .catch(error => {
    console.error('Failed to populate database:', error);
    process.exit(1);
  });

export default populateDatabase;