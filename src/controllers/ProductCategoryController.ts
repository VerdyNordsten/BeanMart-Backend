import type { Request, Response } from 'express';
import { ProductCategoryModel } from '../models/ProductCategoryModel';
import { ProductCategorySchema } from '../validation/schemas';
import { z } from 'zod';

const productCategoryModel = new ProductCategoryModel();

export class ProductCategoryController {
  // Add category to product
  async addCategoryToProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = ProductCategorySchema.parse(req.body);
      const productCategory = await productCategoryModel.addCategoryToProduct(data);
      res.status(201).json({ success: true, data: productCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error adding category to product', error });
      }
    }
  }

  // Remove category from product
  async removeCategoryFromProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const data = ProductCategorySchema.parse(req.body);
      const deleted = await productCategoryModel.removeCategoryFromProduct(data);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product category relation not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Category removed from product successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error removing category from product', error });
      }
    }
  }

  // Get categories for product
  async getCategoriesForProduct(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      const categories = await productCategoryModel.getCategoriesForProduct(product_id);
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching categories for product', error });
    }
  }

  // Get products for category
  async getProductsForCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category_id } = req.params;
      const products = await productCategoryModel.getProductsForCategory(category_id);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products for category', error });
    }
  }
}