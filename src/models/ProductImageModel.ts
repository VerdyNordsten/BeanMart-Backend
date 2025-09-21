import type { ProductImage } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateProductImageSchema, UpdateProductImageSchema } from '../validation/schemas';
import type { z } from 'zod';

export class ProductImageModel {
  // Find images by product ID
  async findByProductId(product_id: string): Promise<ProductImage[]> {
    const query = 'SELECT * FROM product_images WHERE product_id = $1 ORDER BY position ASC';
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Find image by ID
  async findById(id: string): Promise<ProductImage | null> {
    const query = 'SELECT * FROM product_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new product image
  async create(imageData: z.infer<typeof CreateProductImageSchema>): Promise<ProductImage> {
    // Validate input
    const validatedData = CreateProductImageSchema.parse(imageData);
    
    const query = `INSERT INTO product_images (product_id, url, position) VALUES ($1, $2, $3) RETURNING *`;
    const values = [validatedData.productId, validatedData.url, validatedData.position];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product image
  async update(id: string, imageData: z.infer<typeof UpdateProductImageSchema>): Promise<ProductImage | null> {
    // Validate input
    const validatedData = UpdateProductImageSchema.parse(imageData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        fields.push(`${key} = ${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE product_images SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a product image
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM product_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Update image position
  async updatePosition(id: string, position: number): Promise<ProductImage | null> {
    const query = 'UPDATE product_images SET position = $1 WHERE id = $2 RETURNING *';
    const result: QueryResult = await pool.query(query, [position, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}