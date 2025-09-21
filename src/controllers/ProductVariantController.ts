import { Request, Response } from 'express';
import { ProductVariantModel } from '../models/ProductVariantModel';
import { CreateProductVariantSchema, UpdateProductVariantSchema } from '../validation/schemas';
import { z } from 'zod';

const productVariantModel = new ProductVariantModel();

export class ProductVariantController {
  // Get all variants for a product
  async getProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      const variants = await productVariantModel.findByProductId(product_id);
      res.status(200).json({ success: true, data: variants });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product variants', error });
    }
  }

  // Get active variants for a product
  async getActiveProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      const variants = await productVariantModel.findActiveByProductId(product_id);
      res.status(200).json({ success: true, data: variants });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching active product variants', error });
    }
  }

  // Get product variant by ID
  async getProductVariantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const variant = await productVariantModel.findById(id);
      
      if (!variant) {
        res.status(404).json({ success: false, message: 'Product variant not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: variant });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product variant', error });
    }
  }

  // Get product variant by SKU
  async getProductVariantBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const variant = await productVariantModel.findBySku(sku);
      
      if (!variant) {
        res.status(404).json({ success: false, message: 'Product variant not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: variant });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product variant', error });
    }
  }

  // Create a new product variant
  async createProductVariant(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const variantData = CreateProductVariantSchema.parse(req.body);
      const newVariant = await productVariantModel.create(variantData);
      res.status(201).json({ success: true, data: newVariant });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating product variant', error });
      }
    }
  }

  // Update product variant
  async updateProductVariant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const variantData = UpdateProductVariantSchema.parse(req.body);
      const updatedVariant = await productVariantModel.update(id, variantData);
      
      if (!updatedVariant) {
        res.status(404).json({ success: false, message: 'Product variant not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedVariant });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product variant', error });
      }
    }
  }

  // Delete product variant
  async deleteProductVariant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productVariantModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product variant not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product variant deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting product variant', error });
    }
  }
}