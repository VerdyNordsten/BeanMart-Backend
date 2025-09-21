import { ProductOptionType } from './index';
import pool from '../config/db';
import { QueryResult } from 'pg';
import { CreateProductOptionTypeSchema, UpdateProductOptionTypeSchema } from '../validation/schemas';
import { z } from 'zod';

export class ProductOptionTypeModel {
  // Find option types by product ID
  async findByProductId(product_id: string): Promise<ProductOptionType[]> {
    const query = 'SELECT * FROM product_option_types WHERE product_id = $1 ORDER BY position ASC';
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Find option type by ID
  async findById(id: string): Promise<ProductOptionType | null> {
    const query = 'SELECT * FROM product_option_types WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new product option type
  async create(optionTypeData: z.infer<typeof CreateProductOptionTypeSchema>): Promise<ProductOptionType> {
    // Validate input
    const validatedData = CreateProductOptionTypeSchema.parse(optionTypeData);
    
    const query = `INSERT INTO product_option_types (product_id, name, position) VALUES ($1, $2, $3) RETURNING *`;
    const values = [validatedData.productId, validatedData.name, validatedData.position];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product option type
  async update(id: string, optionTypeData: z.infer<typeof UpdateProductOptionTypeSchema>): Promise<ProductOptionType | null> {
    // Validate input
    const validatedData = UpdateProductOptionTypeSchema.parse(optionTypeData);
    
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
    const query = `UPDATE product_option_types SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a product option type
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM product_option_types WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}