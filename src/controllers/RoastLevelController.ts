import type { Request, Response } from 'express';
import { RoastLevelModel } from '../models/RoastLevelModel';
import { ProductRoastLevelModel } from '../models/ProductRoastLevelModel';
import { CreateRoastLevelSchema, UpdateRoastLevelSchema, ProductRoastLevelSchema } from '../validation/schemas';
import { z } from 'zod';

const roastLevelModel = new RoastLevelModel();
const productRoastLevelModel = new ProductRoastLevelModel();

export class RoastLevelController {
  // Get all roast levels
  async getAllRoastLevels(req: Request, res: Response): Promise<void> {
    try {
      const roastLevels = await roastLevelModel.findAll();
      res.status(200).json({ success: true, data: roastLevels });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching roast levels', error });
    }
  }

  // Get roast level by ID
  async getRoastLevelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roastLevel = await roastLevelModel.findById(id);
      
      if (!roastLevel) {
        res.status(404).json({ success: false, message: 'Roast level not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: roastLevel });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching roast level', error });
    }
  }

  // Get roast level by slug
  async getRoastLevelBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const roastLevel = await roastLevelModel.findBySlug(slug);
      
      if (!roastLevel) {
        res.status(404).json({ success: false, message: 'Roast level not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: roastLevel });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching roast level', error });
    }
  }

  // Create a new roast level
  async createRoastLevel(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const roastLevelData = CreateRoastLevelSchema.parse(req.body);
      const newRoastLevel = await roastLevelModel.create(roastLevelData);
      res.status(201).json({ success: true, data: newRoastLevel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating roast level', error });
      }
    }
  }

  // Update roast level
  async updateRoastLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const roastLevelData = UpdateRoastLevelSchema.parse(req.body);
      const updatedRoastLevel = await roastLevelModel.update(id, roastLevelData);
      
      if (!updatedRoastLevel) {
        res.status(404).json({ success: false, message: 'Roast level not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedRoastLevel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating roast level', error });
      }
    }
  }

  // Delete roast level
  async deleteRoastLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await roastLevelModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Roast level not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Roast level deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting roast level', error });
    }
  }

  // Get products for roast level
  async getProductsForRoastLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productRoastLevels = await productRoastLevelModel.getProductsForRoastLevel(id);
      res.status(200).json({ success: true, data: productRoastLevels });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products for roast level', error });
    }
  }

  // Add roast level to product
  async addRoastLevelToProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = ProductRoastLevelSchema.parse(req.body);
      const productRoastLevel = await productRoastLevelModel.addRoastLevelToProduct(data);
      res.status(201).json({ success: true, data: productRoastLevel });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error adding roast level to product', error });
      }
    }
  }

  // Remove roast level from product
  async removeRoastLevelFromProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = ProductRoastLevelSchema.parse(req.body);
      const deleted = await productRoastLevelModel.removeRoastLevelFromProduct(data);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product roast level relation not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Roast level removed from product successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error removing roast level from product', error });
      }
    }
  }
}
