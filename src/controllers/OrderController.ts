import type { Request, Response } from 'express';
import { OrderModel } from '../models/OrderModel';
import { OrderItemModel } from '../models/OrderItemModel';
import { ProductVariantModel } from '../models/ProductVariantModel';
import { CreateOrderSchema, UpdateOrderSchema } from '../validation/schemas';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth';

const orderModel = new OrderModel();
const orderItemModel = new OrderItemModel();
const productVariantModel = new ProductVariantModel();

export class OrderController {
  // Get all orders (admin only)
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await orderModel.findAll();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching orders', error });
    }
  }

  // Get orders by user ID (for logged in user)
  async getOrdersByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const orders = await orderModel.findByUserId(userId);
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching orders', error });
    }
  }

  // Get order by ID
  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderModel.findById(id);
      
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      // Get order items
      const orderItems = await orderItemModel.findByOrderId(id);
      
      res.status(200).json({ success: true, data: { ...order, items: orderItems } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching order', error });
    }
  }

  // Create a new order
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      // Validate input
      const orderData = CreateOrderSchema.parse({
        ...req.body,
        userId
      });
      
      // Generate order number if not provided
      if (!orderData.orderNumber) {
        orderData.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      // Validate order items and calculate total
      let totalAmount = 0;
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          // Get product variant to verify price and stock
          const variant = await productVariantModel.findById(item.productVariantId);
          if (!variant) {
            res.status(400).json({ success: false, message: `Product variant ${item.productVariantId} not found` });
            return;
          }
          
          // Check stock
          if (variant.stock < item.quantity) {
            res.status(400).json({ success: false, message: `Insufficient stock for ${variant.sku}` });
            return;
          }
          
          // Validate price
          if (Math.abs(variant.price - item.pricePerUnit) > 0.01) {
            res.status(400).json({ success: false, message: `Price mismatch for ${variant.sku}` });
            return;
          }
          
          totalAmount += item.totalPrice;
        }
      }
      
      // Set total amount
      orderData.totalAmount = totalAmount;
      
      // Create order
      const newOrder = await orderModel.create(orderData);
      
      // Create order items
      const orderItems = [];
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          const orderItem = await orderItemModel.create({
            orderId: newOrder.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            totalPrice: item.totalPrice
          });
          orderItems.push(orderItem);
        }
      }
      
      res.status(201).json({ success: true, data: { ...newOrder, items: orderItems } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating order', error });
      }
    }
  }

  // Update order (admin only)
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const orderData = UpdateOrderSchema.parse(req.body);
      
      const updatedOrder = await orderModel.update(id, orderData);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating order', error });
      }
    }
  }

  // Delete order (admin only)
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await orderModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting order', error });
    }
  }
}