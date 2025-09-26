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
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await orderItemModel.findByOrderIdWithDetails(order.id);
          return {
            ...order,
            items: orderItems
          };
        })
      );
      res.status(200).json({ 
        success: true, 
        data: {
          orders: ordersWithItems,
          pagination: {
            page: 1,
            limit: 10,
            total: ordersWithItems.length,
            total_pages: 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await orderItemModel.findByOrderIdWithDetails(order.id);
          return {
            ...order,
            items: orderItems
          };
        })
      );
      res.status(200).json({ success: true, data: ordersWithItems });
    } catch (error) {
      console.error('Error fetching user orders:', error);
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
      
      // Get order items with product details
      const orderItems = await orderItemModel.findByOrderIdWithDetails(id);
      
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
      orderData.orderNumber ??= `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
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
            res.status(400).json({ success: false, message: `Insufficient stock for variant ${variant.id}` });
            return;
          }
          
          // Validate price
          if (Math.abs(variant.price - item.pricePerUnit) > 0.01) {
            res.status(400).json({ success: false, message: `Price mismatch for variant ${variant.id}` });
            return;
          }
          
          totalAmount += item.totalPrice;
        }
      }
      
      // Set total amount
      orderData.totalAmount = totalAmount;
      
      // Create order
      const orderCreateData = {
        userId: orderData.userId,
        orderNumber: orderData.orderNumber!,
        status: orderData.status,
        totalAmount: orderData.totalAmount!,
        shippingCost: orderData.shippingCost || 0,
        currency: orderData.currency,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        notes: orderData.notes
      };
      
      const newOrder = await orderModel.create(orderCreateData as any);
      
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
      console.error('Order creation error:', error);
      
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.issues);
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        console.error('General error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ success: false, message: 'Error creating order', error: errorMessage });
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

  // Update order status (admin only)
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }
      
      const updateData = { status };
      const updatedOrder = await orderModel.update(id, updateData);
      
      if (!updatedOrder) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating order status', error });
    }
  }

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const order = await orderModel.findById(id);
      
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }
      
      // Check if user owns the order or is admin
      if (order.user_id !== userId && !req.isAdmin) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      
      // Only allow cancellation if order is pending or confirmed
      if (!['pending', 'confirmed'].includes(order.status)) {
        res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        return;
      }
      
      const updatedOrder = await orderModel.update(id, { status: 'cancelled' });
      
      res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error cancelling order', error });
    }
  }
}