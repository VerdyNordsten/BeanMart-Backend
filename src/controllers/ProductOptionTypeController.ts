import { Request, Response } from 'express';
import { ProductOptionTypeModel } from '../models/ProductOptionTypeModel';
import { CreateProductOptionTypeSchema, UpdateProductOptionTypeSchema } from '../validation/schemas';
import { z } from 'zod';

const productOptionTypeModel = new ProductOptionTypeModel();

export class ProductOptionTypeController {
  // Get all option types for a product
  async getProductOptionTypes(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      const optionTypes = await productOptionTypeModel.findByProductId(product_id);
      res.status(200).json({ success: true, data: optionTypes });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product option types', error });
    }
  }

  // Get product option type by ID
  async getProductOptionTypeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const optionType = await productOptionTypeModel.findById(id);
      
      if (!optionType) {
        res.status(404).json({ success: false, message: 'Product option type not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: optionType });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product option type', error });
    }
  }

  // Create a new product option type
  async createProductOptionType(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const optionTypeData = CreateProductOptionTypeSchema.parse(req.body);
      const newOptionType = await productOptionTypeModel.create(optionTypeData);
      res.status(201).json({ success: true, data: newOptionType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating product option type', error });
      }
    }
  }

  // Update product option type
  async updateProductOptionType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const optionTypeData = UpdateProductOptionTypeSchema.parse(req.body);
      const updatedOptionType = await productOptionTypeModel.update(id, optionTypeData);
      
      if (!updatedOptionType) {
        res.status(404).json({ success: false, message: 'Product option type not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedOptionType });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product option type', error });
      }
    }
  }

  // Delete product option type
  async deleteProductOptionType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productOptionTypeModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product option type not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product option type deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting product option type', error });
    }
  }
}