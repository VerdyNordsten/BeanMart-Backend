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
    return result.rows[0];
  }

  // Update a user
  async update(id: string, userData: z.infer<typeof UpdateUserSchema>): Promise<User | null> {
    // Validate input
    const validatedData = UpdateUserSchema.parse(userData);
    
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
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a user
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}