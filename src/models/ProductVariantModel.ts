import type { ProductVariant } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateProductVariantSchema, UpdateProductVariantSchema } from '../validation/schemas';
import { z } from 'zod';
import { VariantImageModel } from './VariantImageModel';

const variantImageModel = new VariantImageModel();

export class ProductVariantModel {
  // Find variants by product ID with images
  async findByProductId(product_id: string): Promise<ProductVariant[]> {
    const query = 'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY is_active DESC, created_at DESC';
    const result: QueryResult = await pool.query(query, [product_id]);
    
    // Get images for each variant
    const variantsWithImages = await Promise.all(
      result.rows.map(async (variant) => {
        const images = await variantImageModel.findByVariantId(variant.id);
        return {
          ...variant,
          images
        };
      })
    );
    
    return variantsWithImages;
  }

  // Find active variants by product ID with images
  async findActiveByProductId(product_id: string): Promise<ProductVariant[]> {
    const query = 'SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query, [product_id]);
    
    // Get images for each variant
    const variantsWithImages = await Promise.all(
      result.rows.map(async (variant) => {
        const images = await variantImageModel.findByVariantId(variant.id);
        return {
          ...variant,
          images
        };
      })
    );
    
    return variantsWithImages;
  }

  // Find variant by ID with images
  async findById(id: string): Promise<ProductVariant | null> {
    const query = 'SELECT * FROM product_variants WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const variant = result.rows[0];
    const images = await variantImageModel.findByVariantId(variant.id);
    
    return {
      ...variant,
      images
    };
  }

  // Create a new product variant
  async create(variantData: z.infer<typeof CreateProductVariantSchema>): Promise<ProductVariant> {
    const query = `INSERT INTO product_variants (product_id, price, compare_at_price, stock, 
                   weight_gram, is_active) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      variantData.product_id,
      variantData.price,
      variantData.compare_at_price,
      variantData.stock,
      variantData.weight_gram,
      variantData.is_active
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a product variant
  async update(id: string, variantData: z.infer<typeof UpdateProductVariantSchema>): Promise<ProductVariant | null> {
    const fields = [];
    const values = [];
    let index = 1;
    
    for (const [key, value] of Object.entries(variantData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE product_variants SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
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