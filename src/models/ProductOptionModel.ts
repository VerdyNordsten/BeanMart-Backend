import { ProductOption } from './index';
import pool from '../config/db';
import { QueryResult } from 'pg';
import { CreateProductOptionSchema, UpdateProductOptionSchema } from '../validation/schemas';
import { z } from 'zod';

export class ProductOptionModel {
  // Find options by option type ID
  async findByOptionTypeId(option_type_id: string): Promise<ProductOption[]> {
    const query = 'SELECT * FROM product_options WHERE option_type_id = $1 ORDER BY position ASC';
    const result: QueryResult = await pool.query(query, [option_type_id]);
    return result.rows;
  }

  // Find option by ID
  async findById(id: string): Promise<ProductOption | null> {
    const query = 'SELECT * FROM product_options WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new product option
  async create(optionData: z.infer<typeof CreateProductOptionSchema>): Promise<ProductOption> {
    // Validate input
    const validatedData = CreateProductOptionSchema.parse(optionData);
    
    const query = `INSERT INTO product_options (option_type_id, value, position) VALUES ($1, $2, $3) RETURNING *`;
    const values = [validatedData.optionTypeId, validatedData.value, validatedData.position];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product option
  async update(id: string, optionData: z.infer<typeof UpdateProductOptionSchema>): Promise<ProductOption | null> {
    // Validate input
    const validatedData = UpdateProductOptionSchema.parse(optionData);
    
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
    const query = `UPDATE product_options SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a product option
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM product_options WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}