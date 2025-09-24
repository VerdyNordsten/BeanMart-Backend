import type { Request, Response } from 'express';
import { VariantImageModel } from '../models/VariantImageModel';
import { CreateVariantImageSchema, UpdateVariantImageSchema } from '../validation/schemas';
import { z } from 'zod';

const variantImageModel = new VariantImageModel();

export class VariantImageController {
  // Get all images for a variant
  async getVariantImages(req: Request, res: Response): Promise<void> {
    try {
      const { variant_id } = req.params;
      const images = await variantImageModel.findByVariantId(variant_id);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching variant images', error });
    }
  }

  // Get variant image by ID
  async getVariantImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const image = await variantImageModel.findById(id);
      
      if (!image) {
        res.status(404).json({ success: false, message: 'Variant image not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: image });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching variant image', error });
    }
  }

  // Create a new variant image
  async createVariantImage(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const imageData = CreateVariantImageSchema.parse(req.body);
      const newImage = await variantImageModel.create(imageData);
      res.status(201).json({ success: true, data: newImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating variant image', error });
      }
    }
  }

  // Update variant image
  async updateVariantImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const imageData = UpdateVariantImageSchema.parse(req.body);
      const updatedImage = await variantImageModel.update(id, imageData);
      
      if (!updatedImage) {
        res.status(404).json({ success: false, message: 'Variant image not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating variant image', error });
      }
    }
  }

  // Delete variant image
  async deleteVariantImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Simple UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid image ID format. Expected UUID format.' 
        });
        return;
      }
      
      const deleted = await variantImageModel.deleteWithFileCleanup(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Variant image not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Variant image deleted successfully' });
    } catch (error) {
      console.error('Error deleting variant image:', error);
      res.status(500).json({ success: false, message: 'Error deleting variant image', error });
    }
  }

  // Smart delete variant image
  async smartDeleteVariantImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Simple UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid image ID format. Expected UUID format.' 
        });
        return;
      }
      
      const result = await variantImageModel.smartDelete(id);
      
      if (!result.success) {
        res.status(404).json({ 
          success: false, 
          message: result.message 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        message: result.message,
        deletedFromStorage: result.deletedFromStorage
      });
    } catch (error) {
      console.error('Error smart deleting variant image:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting variant image', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}