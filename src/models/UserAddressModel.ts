import type { UserAddress } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateUserAddressSchema, UpdateUserAddressSchema } from '../validation/schemas';
import type { z } from 'zod';

export class UserAddressModel {
  // Find addresses by user ID
  async findByUserId(user_id: string): Promise<UserAddress[]> {
    const query = 'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
    const result: QueryResult = await pool.query(query, [user_id]);
    return result.rows;
  }

  // Find address by ID
  async findById(id: string): Promise<UserAddress | null> {
    const query = 'SELECT * FROM user_addresses WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new user address
  async create(addressData: z.infer<typeof CreateUserAddressSchema>): Promise<UserAddress> {
    // Validate input
    const validatedData = CreateUserAddressSchema.parse(addressData);
    
    const query = `INSERT INTO user_addresses (user_id, label, recipient_name, phone, address_line1, 
                   address_line2, city, state, postal_code, country, is_default) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
    const values = [
      validatedData.userId,
      validatedData.label,
      validatedData.recipientName,
      validatedData.phone,
      validatedData.addressLine1,
      validatedData.addressLine2,
      validatedData.city,
      validatedData.state,
      validatedData.postalCode,
      validatedData.country,
      validatedData.isDefault
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a user address
  async update(id: string, addressData: z.infer<typeof UpdateUserAddressSchema>): Promise<UserAddress | null> {
    // Validate input
    const validatedData = UpdateUserAddressSchema.parse(addressData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      userId: 'user_id',
      recipientName: 'recipient_name',
      addressLine1: 'address_line1',
      addressLine2: 'address_line2',
      postalCode: 'postal_code',
      isDefault: 'is_default'
    };
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = ${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE user_addresses SET ${fields.join(', ')} WHERE id = ${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a user address
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM user_addresses WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Set address as default
  async setDefault(id: string, user_id: string): Promise<UserAddress | null> {
    // First set all user addresses to not default
    await pool.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [user_id]);
    
    // Then set the specified address as default
    const query = 'UPDATE user_addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *';
    const result: QueryResult = await pool.query(query, [id, user_id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}