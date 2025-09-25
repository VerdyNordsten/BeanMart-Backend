import type { Product } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateProductSchema, UpdateProductSchema } from '../validation/schemas';
import type { z } from 'zod';

export class ProductModel {
  // Find all products
  async findAll(): Promise<Product[]> {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    
    // Return data as-is from database (snake_case)
    return result.rows;
  }

  // Find product by ID
  async findById(id: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Return data as-is from database (snake_case)
    return result.rows[0];
  }

  // Find products by slug
  async findBySlug(slug: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE slug = $1';
    const result: QueryResult = await pool.query(query, [slug]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Return data as-is from database (snake_case)
    return result.rows[0];
  }

  // Find active products
  async findActive(): Promise<Product[]> {
    const query = 'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    
    // Return data as-is from database (snake_case)
    return result.rows;
  }

  // Create a new product
  async create(productData: z.infer<typeof CreateProductSchema>): Promise<Product> {
    // Validate input with schema
    const validatedData = CreateProductSchema.parse(productData);
    
    // Use the validated data directly since Zod will apply defaults
    const query = `INSERT INTO products (slug, name, short_description, long_description, 
                   currency, is_active) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      validatedData.slug,
      validatedData.name,
      validatedData.short_description,
      validatedData.long_description,
      validatedData.currency, // Zod will ensure this has the default 'USD' if not provided
      validatedData.is_active // Zod will ensure this has the default true if not provided
    ];
    
    const result: QueryResult = await pool.query(query, values);
    
    // Return data as-is from database (snake_case)
    return result.rows[0];
  }

  // Update a product
  async update(id: string, productData: z.infer<typeof UpdateProductSchema>): Promise<Product | null> {
    // Validate input with schema
    const validatedData = UpdateProductSchema.parse(productData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Add fields to update only if they are defined in the validated data
    if (validatedData.slug !== undefined) {
      fields.push(`slug = $${index}`);
      values.push(validatedData.slug);
      index++;
    }
    
    if (validatedData.name !== undefined) {
      fields.push(`name = $${index}`);
      values.push(validatedData.name);
      index++;
    }
    
    if (validatedData.short_description !== undefined) {
      fields.push(`short_description = $${index}`);
      values.push(validatedData.short_description);
      index++;
    }
    
    if (validatedData.long_description !== undefined) {
      fields.push(`long_description = $${index}`);
      values.push(validatedData.long_description);
      index++;
    }
    
    if (validatedData.currency !== undefined) {
      fields.push(`currency = $${index}`);
      values.push(validatedData.currency);
      index++;
    }
    
    if (validatedData.is_active !== undefined) {
      fields.push(`is_active = $${index}`);
      values.push(validatedData.is_active);
      index++;
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Return data as-is from database (snake_case)
    return result.rows[0];
  }

  // Delete a product
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}