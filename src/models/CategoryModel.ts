import type { Category } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateCategorySchema, UpdateCategorySchema } from '../validation/schemas';
import type { z } from 'zod';

export class CategoryModel {
  // Find all categories
  async findAll(): Promise<Category[]> {
    const query = 'SELECT * FROM categories ORDER BY name';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find category by ID
  async findById(id: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find category by slug
  async findBySlug(slug: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE slug = $1';
    const result: QueryResult = await pool.query(query, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new category
  async create(categoryData: z.infer<typeof CreateCategorySchema>): Promise<Category> {
    // Validate input
    const validatedData = CreateCategorySchema.parse(categoryData);
    
    const query = `INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *`;
    const values = [validatedData.slug, validatedData.name];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a category
  async update(id: string, categoryData: z.infer<typeof UpdateCategorySchema>): Promise<Category | null> {
    // Validate input
    const validatedData = UpdateCategorySchema.parse(categoryData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    for (const [key, value] of Object.entries(validatedData)) {
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
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a category
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM categories WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}