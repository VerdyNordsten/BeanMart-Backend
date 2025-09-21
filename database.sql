-- Initialize Beanmart database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (pembeli)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER ADDRESSES
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country CHAR(2) NOT NULL DEFAULT 'ID',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- CATEGORIES (opsional)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- PRODUCTS (kopi)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  source_url TEXT,
  base_price NUMERIC(12,2),
  base_compare_at_price NUMERIC(12,2),
  currency CHAR(3) NOT NULL DEFAULT 'IDR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sku TEXT,
  weight_gram INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- RELASI PRODUCT ↔ CATEGORY
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- PRODUCT IMAGES (urutan cover → gallery)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(position);

-- OPTION TYPES (contoh: "Grind", "Size", "Roast")
CREATE TABLE IF NOT EXISTS product_option_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_product_option_types_product_id ON product_option_types(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_types_position ON product_option_types(position);

-- OPTION VALUES (contoh: "Whole Bean", "250g", "Medium")
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type_id UUID NOT NULL REFERENCES product_option_types(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_product_options_option_type_id ON product_options(option_type_id);
CREATE INDEX IF NOT EXISTS idx_product_options_position ON product_options(position);

-- VARIANTS (kombinasi opsi; jika tanpa variasi → varian default)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  price NUMERIC(12,2) NOT NULL,
  compare_at_price NUMERIC(12,2),
  stock INTEGER NOT NULL DEFAULT 0,
  weight_gram INTEGER,
  option1_value TEXT,
  option2_value TEXT,
  option3_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

-- VARIANT IMAGES (opsional)
CREATE TABLE IF NOT EXISTS variant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_variant_images_variant_id ON variant_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_images_position ON variant_images(position);

-- Sample data for testing
-- Uncomment the following lines if you want to insert sample data

/*
INSERT INTO users (email, phone, full_name) VALUES 
('john.doe@example.com', '+6281234567890', 'John Doe'),
('jane.smith@example.com', '+6281234567891', 'Jane Smith');

INSERT INTO categories (slug, name) VALUES 
('coffee', 'Coffee'),
('merchandise', 'Merchandise');

INSERT INTO products (slug, name, short_description, base_price, currency, is_active) VALUES 
('sumatra-mandheling', 'Sumatra Mandheling Coffee', 'Rich, full-bodied coffee with earthy notes', 125000, 'IDR', TRUE),
('ethiopian-yirgacheffe', 'Ethiopian Yirgacheffe Coffee', 'Bright, floral coffee with citrus notes', 135000, 'IDR', TRUE);

INSERT INTO product_categories (product_id, category_id) VALUES 
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), (SELECT id FROM categories WHERE slug = 'coffee')),
((SELECT id FROM products WHERE slug = 'ethiopian-yirgacheffe'), (SELECT id FROM categories WHERE slug = 'coffee'));

INSERT INTO product_images (product_id, url, position) VALUES 
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'https://example.com/sumatra-mandheling.jpg', 1),
((SELECT id FROM products WHERE slug = 'ethiopian-yirgacheffe'), 'https://example.com/ethiopian-yirgacheffe.jpg', 1);

INSERT INTO product_option_types (product_id, name, position) VALUES 
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'Grind', 1),
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'Size', 2);

INSERT INTO product_options (option_type_id, value, position) VALUES 
((SELECT id FROM product_option_types WHERE name = 'Grind'), 'Whole Bean', 1),
((SELECT id FROM product_option_types WHERE name = 'Grind'), 'Ground', 2),
((SELECT id FROM product_option_types WHERE name = 'Size'), '250g', 1),
((SELECT id FROM product_option_types WHERE name = 'Size'), '500g', 2);

INSERT INTO product_variants (product_id, sku, price, stock, option1_value, option2_value) VALUES 
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'SM-WB-250', 125000, 50, 'Whole Bean', '250g'),
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'SM-WB-500', 145000, 30, 'Whole Bean', '500g'),
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'SM-G-250', 125000, 40, 'Ground', '250g'),
((SELECT id FROM products WHERE slug = 'sumatra-mandheling'), 'SM-G-500', 145000, 20, 'Ground', '500g');
*/