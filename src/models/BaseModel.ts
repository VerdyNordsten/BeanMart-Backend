import pool from '../config/db';
import { QueryResult } from 'pg';

export abstract class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Find all records
  async findAll(): Promise<any[]> {
    const query = `SELECT * FROM ${this.tableName}`;
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find record by ID
  async findById(id: string): Promise<any | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new record
  async create(data: any): Promise<any> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a record by ID
  async update(id: string, data: any): Promise<any | null> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
    const result: QueryResult = await pool.query(query, [...values, id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a record by ID
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}