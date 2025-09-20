import { Product } from './index';
import { BaseModel } from './BaseModel';
import pool from '../config/db';
import { QueryResult } from 'pg';

export class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  // Find products by slug
  async findBySlug(slug: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE slug = $1';
    const result: QueryResult = await pool.query(query, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find active products
  async findActive(): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Create a new product
  async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const query = `INSERT INTO products (slug, name, short_description, long_description, 
                   source_url, base_price, base_compare_at_price, currency, is_active, sku, weight_gram) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
    const values = [
      productData.slug,
      productData.name,
      productData.short_description,
      productData.long_description,
      productData.source_url,
      productData.base_price,
      productData.base_compare_at_price,
      productData.currency,
      productData.is_active,
      productData.sku,
      productData.weight_gram
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }
}