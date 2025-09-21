import type { OrderItem } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { z } from 'zod';

// Order Item schema for validation
export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  pricePerUnit: z.number().positive(),
  totalPrice: z.number().positive(),
  createdAt: z.date().optional(),
});

export const CreateOrderItemSchema = OrderItemSchema.omit({ id: true, createdAt: true });
export const UpdateOrderItemSchema = OrderItemSchema.partial().omit({ id: true, createdAt: true });

export class OrderItemModel {
  // Find all order items
  async findAll(): Promise<OrderItem[]> {
    const query = 'SELECT * FROM order_items ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query);
    return result.rows;
  }

  // Find order items by order ID
  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    const query = 'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at DESC';
    const result: QueryResult = await pool.query(query, [orderId]);
    return result.rows;
  }

  // Find order item by ID
  async findById(id: string): Promise<OrderItem | null> {
    const query = 'SELECT * FROM order_items WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new order item
  async create(orderItemData: z.infer<typeof CreateOrderItemSchema>): Promise<OrderItem> {
    const validatedData = CreateOrderItemSchema.parse(orderItemData);
    
    const query = `INSERT INTO order_items (order_id, product_variant_id, quantity, price_per_unit, total_price) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [
      validatedData.orderId,
      validatedData.productVariantId,
      validatedData.quantity,
      validatedData.pricePerUnit,
      validatedData.totalPrice
    ];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update an order item
  async update(id: string, orderItemData: z.infer<typeof UpdateOrderItemSchema>): Promise<OrderItem | null> {
    const validatedData = UpdateOrderItemSchema.parse(orderItemData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    // Map camelCase to snake_case for database fields
    const fieldMap: Record<string, string> = {
      orderId: 'order_id',
      productVariantId: 'product_variant_id',
      pricePerUnit: 'price_per_unit',
      totalPrice: 'total_price'
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
    const query = `UPDATE order_items SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete an order item
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM order_items WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}