import { Request, Response } from 'express';
import { ProductImageModel } from '../models/ProductImageModel';
import { CreateProductImageSchema, UpdateProductImageSchema } from '../validation/schemas';
import { z } from 'zod';

const productImageModel = new ProductImageModel();

export class ProductImageController {
  // Get all images for a product
  async getProductImages(req: Request, res: Response): Promise<void> {
    try {
      const { product_id } = req.params;
      const images = await productImageModel.findByProductId(product_id);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product images', error });
    }
  }

  // Get product image by ID
  async getProductImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const image = await productImageModel.findById(id);
      
      if (!image) {
        res.status(404).json({ success: false, message: 'Product image not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: image });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product image', error });
    }
  }

  // Create a new product image
  async createProductImage(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const imageData = CreateProductImageSchema.parse(req.body);
      const newImage = await productImageModel.create(imageData);
      res.status(201).json({ success: true, data: newImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating product image', error });
      }
    }
  }

  // Update product image
  async updateProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const imageData = UpdateProductImageSchema.parse(req.body);
      const updatedImage = await productImageModel.update(id, imageData);
      
      if (!updatedImage) {
        res.status(404).json({ success: false, message: 'Product image not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product image', error });
      }
    }
  }

  // Delete product image
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productImageModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product image not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product image deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting product image', error });
    }
  }

  // Update image position
  async updateImagePosition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { position } = req.body;
      const updatedImage = await productImageModel.updatePosition(id, position);
      
      if (!updatedImage) {
        res.status(404).json({ success: false, message: 'Product image not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedImage });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating image position', error });
    }
  }
}