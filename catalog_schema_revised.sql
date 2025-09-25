-- catalog_schema_revised.sql
-- PostgreSQL schema (idempotent-ish) for Products, Variants (with single image), and Variant Images
-- Includes: FK with ON DELETE CASCADE, 1 image per variant (UNIQUE), useful CHECKs, indexes, and updated_at triggers.

------------------------------------------------------------
-- 0) Extensions
------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- for gen_random_uuid()

------------------------------------------------------------
-- 1) Helper: trigger to auto-update updated_at
------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

------------------------------------------------------------
-- 2) Core Tables
------------------------------------------------------------

-- 2.1 Products
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  short_description TEXT,
  long_description  TEXT,
  currency    TEXT        NOT NULL DEFAULT 'USD',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price          NUMERIC(12,2) NOT NULL,
  compare_at_price NUMERIC(12,2),
  weight_gram    INT,
  stock          INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- checks to keep data sane
  CONSTRAINT chk_price_nonneg       CHECK (price >= 0),
  CONSTRAINT chk_compare_nonneg     CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  CONSTRAINT chk_compare_ge_price   CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  CONSTRAINT chk_stock_nonneg       CHECK (stock >= 0)
);

-- 2.3 Variant Images (ONE image per variant)
CREATE TABLE IF NOT EXISTS variant_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id  UUID NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  position    INT  NOT NULL DEFAULT 1,
  alt         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_position_one CHECK (position = 1)
);

------------------------------------------------------------
-- 3) Triggers to maintain updated_at
------------------------------------------------------------
DO $$ BEGIN
  CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_product_variants_updated
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_variant_images_updated
  BEFORE UPDATE ON variant_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

------------------------------------------------------------
-- 4) Helpful Indexes
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_updated         ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active          ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_variants_product_active  ON product_variants(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_variant_images_variant   ON variant_images(variant_id);

------------------------------------------------------------
-- 5) (Optional) Soft Delete columns (commented out)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- ALTER TABLE variant_images ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- Then replace hard deletes in app with setting deleted_at, and filter queries with WHERE deleted_at IS NULL.

-- End of file.
