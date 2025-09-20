import { Category } from './index';
import { BaseModel } from './BaseModel';
import pool from '../config/db';
import { QueryResult } from 'pg';

export class CategoryModel extends BaseModel {
  constructor() {
    super('categories');
  }

  // Find category by slug
  async findBySlug(slug: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE slug = $1';
    const result: QueryResult = await pool.query(query, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new category
  async create(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const query = `INSERT INTO categories (slug, name) VALUES ($1, $2) RETURNING *`;
    const values = [categoryData.slug, categoryData.name];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }
}