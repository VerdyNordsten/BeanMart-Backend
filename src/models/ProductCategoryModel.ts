import type { ProductCategory } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { ProductCategorySchema } from '../validation/schemas';
import type { z } from 'zod';

export class ProductCategoryModel {
  // Add category to product
  async addCategoryToProduct(data: z.infer<typeof ProductCategorySchema>): Promise<ProductCategory> {
    // Validate input
    const validatedData = ProductCategorySchema.parse(data);
    
    const query = `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) RETURNING *`;
    const values = [validatedData.productId, validatedData.categoryId];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Remove category from product
  async removeCategoryFromProduct(data: z.infer<typeof ProductCategorySchema>): Promise<boolean> {
    // Validate input
    const validatedData = ProductCategorySchema.parse(data);
    
    const query = `DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2`;
    const result: QueryResult = await pool.query(query, [validatedData.productId, validatedData.categoryId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Get categories for product
  async getCategoriesForProduct(product_id: string): Promise<any[]> {
    const query = `
      SELECT 
        pc.*,
        c.id as category_id,
        c.slug as category_slug,
        c.name as category_name
      FROM product_categories pc
      JOIN categories c ON pc.category_id = c.id
      WHERE pc.product_id = $1
      ORDER BY c.name
    `;
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rows;
  }

  // Get products for category
  async getProductsForCategory(category_id: string): Promise<ProductCategory[]> {
    const query = `SELECT * FROM product_categories WHERE category_id = $1`;
    const result: QueryResult = await pool.query(query, [category_id]);
    return result.rows;
  }

  // Remove all categories from product
  async removeAllCategoriesFromProduct(product_id: string): Promise<boolean> {
    const query = `DELETE FROM product_categories WHERE product_id = $1`;
    const result: QueryResult = await pool.query(query, [product_id]);
    return result.rowCount !== null && result.rowCount >= 0;
  }
}