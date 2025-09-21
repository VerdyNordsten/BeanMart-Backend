import type { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { ProductImageModel } from '../models/ProductImageModel';
import { ProductVariantModel } from '../models/ProductVariantModel';
import { CreateProductSchema, UpdateProductSchema } from '../validation/schemas';
import { z } from 'zod';

const productModel = new ProductModel();
const productImageModel = new ProductImageModel();
const productVariantModel = new ProductVariantModel();

export class ProductController {
  // Get all products
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productModel.findAll();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products', error });
    }
  }

  // Get active products
  async getActiveProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productModel.findActive();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching active products', error });
    }
  }

  // Get product by ID
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productModel.findById(id);
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product', error });
    }
  }

  // Get product by slug
  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await productModel.findBySlug(slug);
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product', error });
    }
  }

  // Create a new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const productData = CreateProductSchema.parse(req.body);
      const newProduct = await productModel.create(productData);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating product', error });
      }
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const productData = UpdateProductSchema.parse(req.body);
      const updatedProduct = await productModel.update(id, productData);
      
      if (!updatedProduct) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product', error });
      }
    }
  }

  // Delete product
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting product', error });
    }
  }

  // Get product images
  async getProductImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if product exists
      const product = await productModel.findById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const images = await productImageModel.findByProductId(id);
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product images', error });
    }
  }

  // Get product variants
  async getProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if product exists
      const product = await productModel.findById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const variants = await productVariantModel.findByProductId(id);
      res.status(200).json({ success: true, data: variants });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product variants', error });
    }
  }

  // Get active product variants
  async getActiveProductVariants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Check if product exists
      const product = await productModel.findById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const variants = await productVariantModel.findActiveByProductId(id);
      res.status(200).json({ success: true, data: variants });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching active product variants', error });
    }
  }
}