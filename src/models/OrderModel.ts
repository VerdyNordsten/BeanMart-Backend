import type { Order } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { z } from 'zod';

// Order schema for validation
export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  orderNumber: z.string(),
  status: z.string().default('pending'),
  totalAmount: z.number(),
  currency: z.string().length(3).default('IDR'),
  shippingAddress: z.any().optional(),
  billingAddress: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateOrderSchema = OrderSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateOrderSchema = OrderSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

export class OrderModel {
  // Find all orders
  async findAll(): Promise<Order[]> {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find orders by user ID
  async findByUserId(userId: string): Promise<Order[]> {
    const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query, [userId]);
    return result.rows;
  }

  // Find order by ID
  async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Find order by order number
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result: QueryResult = await pool.query(query, [orderNumber]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new order
  async create(orderData: z.infer<typeof CreateOrderSchema>): Promise<Order> {
    const validatedData = CreateOrderSchema.parse(orderData);
    
    const query = `INSERT INTO orders (user_id, order_number, status, total_amount, currency, shipping_address, billing_address, notes) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const values = [
      validatedData.userId,
      validatedData.orderNumber,
      validatedData.status,
      validatedData.totalAmount,
      validatedData.currency,
      validatedData.shippingAddress,
      validatedData.billingAddress,
      validatedData.notes
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update an order
  async update(id: string, orderData: z.infer<typeof UpdateOrderSchema>): Promise<Order | null> {
    const validatedData = UpdateOrderSchema.parse(orderData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      userId: 'user_id',
      orderNumber: 'order_number',
      totalAmount: 'total_amount',
      shippingAddress: 'shipping_address',
      billingAddress: 'billing_address'
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
    const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete an order
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM orders WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}