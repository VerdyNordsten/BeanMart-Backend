-- USERS (pembeli)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text,
  full_name text,
  password_hash text, -- jika pakai auth eksternal supabase, ini opsional
  created_at timestamptz not null default now()
);

-- USER ADDRESSES
create table if not exists user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text, -- Rumah/Kantor
  recipient_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'ID',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- CATEGORIES (opsional)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

-- PRODUCTS (kopi)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  long_description text,
  source_url text, -- "Link Sumber Produk" di sheet
  base_price numeric(12,2), -- harga default jika tanpa varian
  base_compare_at_price numeric(12,2), -- harga sebelum diskon (opsional)
  currency char(3) not null default 'IDR',
  is_active boolean not null default true,
  sku text,      -- boleh kosong; varian akan punya SKU sendiri
  weight_gram int, -- default weight jika tanpa varian
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_active on products(is_active);

-- RELASI PRODUCT ↔ CATEGORY
create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- PRODUCT IMAGES (urutan cover → gallery)
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  position int not null default 1
);

create index if not exists idx_product_images_product on product_images(product_id, position);

-- OPTION TYPES (contoh: "Grind", "Size", "Roast")
create table if not exists product_option_types (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,       -- dari "Nama Variasi 1/2/3"
  position int not null default 1
);

-- OPTION VALUES (contoh: "Whole Bean", "250g", "Medium")
create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  option_type_id uuid not null references product_option_types(id) on delete cascade,
  value text not null,      -- dari "Opsi Variasi 1/2/3"
  position int not null default 1,
  unique (option_type_id, value)
);

-- VARIANTS (kombinasi opsi; jika tanpa variasi → varian default)
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2), -- harga sebelum diskon, jika ada
  stock int not null default 0,
  weight_gram int,
  option1_value text, -- denormalized untuk query cepat (nullable)
  option2_value text,
  option3_value text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_variants_product on product_variants(product_id, is_active);

-- VARIANT IMAGES (opsional)
create table if not exists variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  url text not null,
  position int not null default 1
);
