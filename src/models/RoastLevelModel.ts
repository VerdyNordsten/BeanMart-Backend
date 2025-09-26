import type { RoastLevel } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateRoastLevelSchema, UpdateRoastLevelSchema } from '../validation/schemas';
import type { z } from 'zod';

export class RoastLevelModel {
  // Find all roast levels
  async findAll(): Promise<RoastLevel[]> {
    const query = 'SELECT * FROM roast_levels ORDER BY name';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find roast level by ID
  async findById(id: string): Promise<RoastLevel | null> {
    const query = 'SELECT * FROM roast_levels WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find roast level by slug
  async findBySlug(slug: string): Promise<RoastLevel | null> {
    const query = 'SELECT * FROM roast_levels WHERE slug = $1';
    const result: QueryResult = await pool.query(query, [slug]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new roast level
  async create(roastLevelData: z.infer<typeof CreateRoastLevelSchema>): Promise<RoastLevel> {
    // Validate input
    const validatedData = CreateRoastLevelSchema.parse(roastLevelData);
    
    const query = `INSERT INTO roast_levels (slug, name) VALUES ($1, $2) RETURNING *`;
    const values = [validatedData.slug, validatedData.name];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a roast level
  async update(id: string, roastLevelData: z.infer<typeof UpdateRoastLevelSchema>): Promise<RoastLevel | null> {
    // Validate input
    const validatedData = UpdateRoastLevelSchema.parse(roastLevelData);
    
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
    const query = `UPDATE roast_levels SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a roast level
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM roast_levels WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
