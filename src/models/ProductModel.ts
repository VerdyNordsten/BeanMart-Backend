import { Product } from './index';
import pool from '../config/db';
import { QueryResult } from 'pg';
import { CreateProductSchema, UpdateProductSchema } from '../validation/schemas';
import { z } from 'zod';

export class ProductModel {
  // Find all products
  async findAll(): Promise<Product[]> {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find product by ID
  async findById(id: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
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
  async create(productData: z.infer<typeof CreateProductSchema>): Promise<Product> {
    // Validate input
    const validatedData = CreateProductSchema.parse(productData);
    
    const query = `INSERT INTO products (slug, name, short_description, long_description, 
                   source_url, base_price, base_compare_at_price, currency, is_active, sku, weight_gram) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
    const values = [
      validatedData.slug,
      validatedData.name,
      validatedData.shortDescription,
      validatedData.longDescription,
      validatedData.sourceUrl,
      validatedData.basePrice,
      validatedData.baseCompareAtPrice,
      validatedData.currency,
      validatedData.isActive,
      validatedData.sku,
      validatedData.weightGram
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product
  async update(id: string, productData: z.infer<typeof UpdateProductSchema>): Promise<Product | null> {
    // Validate input
    const validatedData = UpdateProductSchema.parse(productData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      shortDescription: 'short_description',
      longDescription: 'long_description',
      sourceUrl: 'source_url',
      basePrice: 'base_price',
      baseCompareAtPrice: 'base_compare_at_price',
      isActive: 'is_active',
      weightGram: 'weight_gram'
    };
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = ${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a product
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}