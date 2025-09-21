import type { Request, Response } from 'express';
import { ProductOptionModel } from '../models/ProductOptionModel';
import { CreateProductOptionSchema, UpdateProductOptionSchema } from '../validation/schemas';
import { z } from 'zod';

const productOptionModel = new ProductOptionModel();

export class ProductOptionController {
  // Get all options for an option type
  async getProductOptions(req: Request, res: Response): Promise<void> {
    try {
      const { option_type_id } = req.params;
      const options = await productOptionModel.findByOptionTypeId(option_type_id);
      res.status(200).json({ success: true, data: options });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product options', error });
    }
  }

  // Get product option by ID
  async getProductOptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const option = await productOptionModel.findById(id);
      
      if (!option) {
        res.status(404).json({ success: false, message: 'Product option not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: option });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product option', error });
    }
  }

  // Create a new product option
  async createProductOption(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const optionData = CreateProductOptionSchema.parse(req.body);
      const newOption = await productOptionModel.create(optionData);
      res.status(201).json({ success: true, data: newOption });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating product option', error });
      }
    }
  }

  // Update product option
  async updateProductOption(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const optionData = UpdateProductOptionSchema.parse(req.body);
      const updatedOption = await productOptionModel.update(id, optionData);
      
      if (!updatedOption) {
        res.status(404).json({ success: false, message: 'Product option not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedOption });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product option', error });
      }
    }
  }

  // Delete product option
  async deleteProductOption(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productOptionModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product option not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product option deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting product option', error });
    }
  }
}