import { Request, Response } from 'express';
import { 
  getAllCoffees, 
  getCoffeeById, 
  createCoffee, 
  updateCoffee, 
  deleteCoffee,
  Coffee 
} from '../../models/Coffee';

// Get all coffees
export const getAllCoffeesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const coffees = await getAllCoffees();
    res.status(200).json(coffees);
  } catch (error) {
    console.error('Error fetching coffees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get coffee by ID
export const getCoffeeByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid coffee ID' });
      return;
    }

    const coffee = await getCoffeeById(id);
    if (!coffee) {
      res.status(404).json({ error: 'Coffee not found' });
      return;
    }

    res.status(200).json(coffee);
  } catch (error) {
    console.error('Error fetching coffee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new coffee
export const createCoffeeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price } = req.body;

    // Validate input
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    // Convert price to string for database
    const priceStr = typeof price === 'number' ? price.toString() : price;

    const newCoffee = await createCoffee(name, priceStr);
    res.status(201).json(newCoffee);
  } catch (error) {
    console.error('Error creating coffee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a coffee
export const updateCoffeeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid coffee ID' });
      return;
    }

    // Validate input
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    // Convert price to string for database
    const priceStr = typeof price === 'number' ? price.toString() : price;

    const updatedCoffee = await updateCoffee(id, name, priceStr);
    if (!updatedCoffee) {
      res.status(404).json({ error: 'Coffee not found' });
      return;
    }

    res.status(200).json(updatedCoffee);
  } catch (error) {
    console.error('Error updating coffee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a coffee
export const deleteCoffeeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid coffee ID' });
      return;
    }

    const result = await deleteCoffee(id);
    if (!result) {
      res.status(404).json({ error: 'Coffee not found' });
      return;
    }

    res.status(200).json({ message: 'Coffee deleted successfully' });
  } catch (error) {
    console.error('Error deleting coffee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};