import type { User } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateUserSchema, UpdateUserSchema } from '../validation/schemas';
import type { z } from 'zod';

export class UserModel {
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find all users
  async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new user
  async create(userData: z.infer<typeof CreateUserSchema>): Promise<User> {
    // Validate input
    const validatedData = CreateUserSchema.parse(userData);
    
    const query = `INSERT INTO users (email, phone, full_name, password_hash) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
      validatedData.email,
      validatedData.phone,
      validatedData.fullName,
      validatedData.passwordHash
    ];
    
    const result: QueryResult = await pool.query(query, values);
    
    // Map database snake_case fields to camelCase for consistent API response
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      password_hash: user.password_hash,
      created_at: user.created_at
    };
  }

  // Update a user
  async update(id: string, userData: z.infer<typeof UpdateUserSchema>): Promise<User | null> {
    // Validate input
    const validatedData = UpdateUserSchema.parse(userData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      fullName: 'full_name',
      passwordHash: 'password_hash'
    };
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = $${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Map database snake_case fields to camelCase for consistent API response
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      password_hash: user.password_hash,
      created_at: user.created_at
    };
  }

  // Delete a user
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}