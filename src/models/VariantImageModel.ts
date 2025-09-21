import type { VariantImage } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateVariantImageSchema, UpdateVariantImageSchema } from '../validation/schemas';
import type { z } from 'zod';

export class VariantImageModel {
  // Find images by variant ID
  async findByVariantId(variant_id: string): Promise<VariantImage[]> {
    const query = 'SELECT * FROM variant_images WHERE variant_id = $1 ORDER BY position ASC';
    const result: QueryResult = await pool.query(query, [variant_id]);
    return result.rows;
  }

  // Find image by ID
  async findById(id: string): Promise<VariantImage | null> {
    const query = 'SELECT * FROM variant_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new variant image
  async create(imageData: z.infer<typeof CreateVariantImageSchema>): Promise<VariantImage> {
    // Validate input
    const validatedData = CreateVariantImageSchema.parse(imageData);
    
    const query = `INSERT INTO variant_images (variant_id, url, position) VALUES ($1, $2, $3) RETURNING *`;
    const values = [validatedData.variantId, validatedData.url, validatedData.position];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a variant image
  async update(id: string, imageData: z.infer<typeof UpdateVariantImageSchema>): Promise<VariantImage | null> {
    // Validate input
    const validatedData = UpdateVariantImageSchema.parse(imageData);
    
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
    const query = `UPDATE variant_images SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a variant image
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM variant_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}