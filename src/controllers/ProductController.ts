import type { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { ProductVariantModel } from '../models/ProductVariantModel';
import { CreateProductSchema, UpdateProductSchema } from '../validation/schemas';
import type { VariantImage } from '../models/index';
import { z } from 'zod';

const productModel = new ProductModel();
const productVariantModel = new ProductVariantModel();

export class ProductController {
  // Get all products with variants and images
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productModel.findAll();
      
      // Get variants and images for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const variants = await productVariantModel.findByProductId(product.id);
          return {
            ...product,
            variants,
            images: variants.flatMap(variant => 
              variant.images ? variant.images.map((img: VariantImage) => ({
                id: img.id,
                url: img.url,
                position: img.position,
                variant_id: variant.id
              })) : []
            )
          };
        })
      );
      
      res.status(200).json({ success: true, data: productsWithDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products', error });
    }
  }

  // Get active products with variants and images
  async getActiveProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await productModel.findActive();
      
      // Get variants and images for each product
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const variants = await productVariantModel.findActiveByProductId(product.id);
          return {
            ...product,
            variants,
            images: variants.flatMap(variant => 
              variant.images ? variant.images.map((img: VariantImage) => ({
                id: img.id,
                url: img.url,
                position: img.position,
                variant_id: variant.id
              })) : []
            )
          };
        })
      );
      
      res.status(200).json({ success: true, data: productsWithDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching active products', error });
    }
  }

  // Get product by ID with variants and images
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productModel.findById(id);
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const variants = await productVariantModel.findByProductId(product.id);
      const productWithDetails = {
        ...product,
        variants,
        images: variants.flatMap(variant => 
          variant.images ? variant.images.map((img: VariantImage) => ({
            id: img.id,
            url: img.url,
            position: img.position,
            variant_id: variant.id
          })) : []
        )
      };
      
      res.status(200).json({ success: true, data: productWithDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product', error });
    }
  }

  // Get product by slug with variants and images
  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await productModel.findBySlug(slug);
      
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
      
      const variants = await productVariantModel.findByProductId(product.id);
      const productWithDetails = {
        ...product,
        variants,
        images: variants.flatMap(variant => 
          variant.images ? variant.images.map((img: VariantImage) => ({
            id: img.id,
            url: img.url,
            position: img.position,
            variant_id: variant.id
          })) : []
        )
      };
      
      res.status(200).json({ success: true, data: productWithDetails });
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