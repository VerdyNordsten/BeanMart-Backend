import { ProductVariant } from './index';
import pool from '../config/db';
import { QueryResult } from 'pg';
import { CreateProductVariantSchema, UpdateProductVariantSchema } from '../validation/schemas';
import { z } from 'zod';

export class ProductVariantModel {
  // Find variants by product ID
  async findByProductId(product_id: string): Promise<ProductVariant[]> {
    const query = 'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY is_active DESC, created_at DESC';
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Find active variants by product ID
  async findActiveByProductId(product_id: string): Promise<ProductVariant[]> {
    const query = 'SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Find variant by ID
  async findById(id: string): Promise<ProductVariant | null> {
    const query = 'SELECT * FROM product_variants WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find variant by SKU
  async findBySku(sku: string): Promise<ProductVariant | null> {
    const query = 'SELECT * FROM product_variants WHERE sku = $1';
    const result: QueryResult = await pool.query(query, [sku]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new product variant
  async create(variantData: z.infer<typeof CreateProductVariantSchema>): Promise<ProductVariant> {
    // Validate input
    const validatedData = CreateProductVariantSchema.parse(variantData);
    
    const query = `INSERT INTO product_variants (product_id, sku, price, compare_at_price, stock, 
                   weight_gram, option1_value, option2_value, option3_value, is_active) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const values = [
      validatedData.productId,
      validatedData.sku,
      validatedData.price,
      validatedData.compareAtPrice,
      validatedData.stock,
      validatedData.weightGram,
      validatedData.option1Value,
      validatedData.option2Value,
      validatedData.option3Value,
      validatedData.isActive
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product variant
  async update(id: string, variantData: z.infer<typeof UpdateProductVariantSchema>): Promise<ProductVariant | null> {
    // Validate input
    const validatedData = UpdateProductVariantSchema.parse(variantData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      compareAtPrice: 'compare_at_price',
      weightGram: 'weight_gram',
      option1Value: 'option1_value',
      option2Value: 'option2_value',
      option3Value: 'option3_value',
      isActive: 'is_active'
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
    const query = `UPDATE product_variants SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a product variant
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM product_variants WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}