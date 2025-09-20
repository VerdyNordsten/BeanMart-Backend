import { db } from '../db';
import { coffees } from './schema';
import { eq, sql } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';

export type Coffee = InferSelectModel<typeof coffees>;

// Get all coffees
export const getAllCoffees = async (): Promise<Coffee[]> => {
  return await db.select().from(coffees);
};

// Get coffee by ID
export const getCoffeeById = async (id: number): Promise<Coffee | null> => {
  const result = await db.select().from(coffees).where(eq(coffees.id, id));
  return result.length > 0 ? result[0] : null;
};

// Create a new coffee
export const createCoffee = async (name: string, price: string): Promise<Coffee> => {
  const [newCoffee] = await db.insert(coffees).values({ name, price }).returning();
  return newCoffee;
};

// Update a coffee
export const updateCoffee = async (id: number, name: string, price: string): Promise<Coffee | null> => {
  const [updatedCoffee] = await db.update(coffees)
    .set({ name, price, updatedAt: sql`NOW()` })
    .where(eq(coffees.id, id))
    .returning();
  return updatedCoffee || null;
};

// Delete a coffee
export const deleteCoffee = async (id: number): Promise<boolean> => {
  const result = await db.delete(coffees).where(eq(coffees.id, id));
  return result.rowCount !== null && result.rowCount > 0;
};