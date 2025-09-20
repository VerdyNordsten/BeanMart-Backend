import { User } from './index';
import { BaseModel } from './BaseModel';
import pool from '../config/db';
import { QueryResult } from 'pg';

export class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new user
  async create(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const query = `INSERT INTO users (email, phone, full_name, password_hash) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
      userData.email,
      userData.phone,
      userData.full_name,
      userData.password_hash
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }
}