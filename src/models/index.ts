// User entity
export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  password_hash?: string;
  created_at: Date;
}

// User Address entity
export interface UserAddress {
  id: string;
  user_id: string;
  label?: string;
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  created_at: Date;
}

// Category entity
export interface Category {
  id: string;
  slug: string;
  name: string;
}

// Product entity
export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description?: string;
  long_description?: string;
  source_url?: string;
  base_price?: number;
  base_compare_at_price?: number;
  currency: string;
  is_active: boolean;
  sku?: string;
  weight_gram?: number;
  created_at: Date;
  updated_at: Date;
}

// Product Category relation
export interface ProductCategory {
  product_id: string;
  category_id: string;
}

// Product Image entity
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
}

// Product Option Type entity
export interface ProductOptionType {
  id: string;
  product_id: string;
  name: string;
  position: number;
}

// Product Option entity
export interface ProductOption {
  id: string;
  option_type_id: string;
  value: string;
  position: number;
}

// Product Variant entity
export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  weight_gram?: number;
  option1_value?: string;
  option2_value?: string;
  option3_value?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Variant Image entity
export interface VariantImage {
  id: string;
  variant_id: string;
  url: string;
  position: number;
}

// Order entity
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Order Item entity
export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  created_at: Date;
}