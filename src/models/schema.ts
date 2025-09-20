import { pgTable, serial, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';

export const coffees = pgTable('coffees', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: serial('order_id').references(() => orders.id),
  coffeeId: serial('coffee_id').references(() => coffees.id),
  quantity: serial('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});