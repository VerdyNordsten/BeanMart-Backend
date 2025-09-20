import { db } from '..';
import { sql } from 'drizzle-orm';

// Get all coffees
export const getAllCoffees = async () => {
  const query = sql`
    SELECT * FROM coffees;
  `;
  return (await db.execute(query)).rows;
};

// Get coffee by ID
export const getCoffeeById = async (id: number) => {
  const query = sql`
    SELECT * FROM coffees WHERE id = ${id};
  `;
  return (await db.execute(query)).rows;
};

// Create a new coffee
export const createCoffee = async (name: string, price: number) => {
  const query = sql`
    INSERT INTO coffees (name, price) VALUES (${name}, ${price}) RETURNING *;
  `;
  return (await db.execute(query)).rows;
};

// Update a coffee
export const updateCoffee = async (id: number, name: string, price: number) => {
  const query = sql`
    UPDATE coffees SET name = ${name}, price = ${price} WHERE id = ${id} RETURNING *;
  `;
  return (await db.execute(query)).rows;
};

// Delete a coffee
export const deleteCoffee = async (id: number) => {
  const query = sql`
    DELETE FROM coffees WHERE id = ${id} RETURNING *;
  `;
  return (await db.execute(query)).rows;
};