import type { ProductRoastLevel } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { ProductRoastLevelSchema } from '../validation/schemas';
import type { z } from 'zod';

export class ProductRoastLevelModel {
  // Get all roast levels for a product
  async getRoastLevelsForProduct(productId: string): Promise<any[]> {
    const query = `
      SELECT 
        prl.*,
        rl.id as roast_level_id,
        rl.slug as roast_level_slug,
        rl.name as roast_level_name
      FROM product_roast_levels prl
      JOIN roast_levels rl ON prl.roast_level_id = rl.id
      WHERE prl.product_id = $1
      ORDER BY rl.name
    `;
    const result: QueryResult = await pool.query(query, [productId]);
    return result.rows;
  }

  // Get all products for a roast level
  async getProductsForRoastLevel(roastLevelId: string): Promise<any[]> {
    const query = `
      SELECT 
        prl.*,
        p.id as product_id,
        p.slug as product_slug,
        p.name as product_name,
        p.short_description,
        p.is_active
      FROM product_roast_levels prl
      JOIN products p ON prl.product_id = p.id
      WHERE prl.roast_level_id = $1
      ORDER BY p.name
    `;
    const result: QueryResult = await pool.query(query, [roastLevelId]);
    return result.rows;
  }

  // Add roast level to product
  async addRoastLevelToProduct(data: z.infer<typeof ProductRoastLevelSchema>): Promise<ProductRoastLevel> {
    // Validate input
    const validatedData = ProductRoastLevelSchema.parse(data);
    
    const query = `
      INSERT INTO product_roast_levels (product_id, roast_level_id) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    const values = [validatedData.productId, validatedData.roastLevelId];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Remove roast level from product
  async removeRoastLevelFromProduct(data: z.infer<typeof ProductRoastLevelSchema>): Promise<boolean> {
    // Validate input
    const validatedData = ProductRoastLevelSchema.parse(data);
    
    const query = `
      DELETE FROM product_roast_levels 
      WHERE product_id = $1 AND roast_level_id = $2
    `;
    const values = [validatedData.productId, validatedData.roastLevelId];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Check if roast level exists for product
  async exists(productId: string, roastLevelId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM product_roast_levels 
      WHERE product_id = $1 AND roast_level_id = $2
    `;
    const result: QueryResult = await pool.query(query, [productId, roastLevelId]);
    return result.rows.length > 0;
  }

  // Remove all roast levels from product
  async removeAllRoastLevelsFromProduct(productId: string): Promise<boolean> {
    const query = `DELETE FROM product_roast_levels WHERE product_id = $1`;
    const result: QueryResult = await pool.query(query, [productId]);
    return result.rowCount !== null && result.rowCount >= 0;
  }
}
