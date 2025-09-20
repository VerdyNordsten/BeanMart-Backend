import { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { Product } from '../models';

const productModel = new ProductModel();

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

  // Get active products
  async getActiveProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productModel.findActive();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products', error });
    }
  }

  // Create a new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> = req.body;
      const newProduct = await productModel.create(productData);
      res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating product', error });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productData: Partial<Product> = req.body;
      const updatedProduct = await productModel.update(id, productData);
      
      if (!updatedProduct) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating product', error });
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
}