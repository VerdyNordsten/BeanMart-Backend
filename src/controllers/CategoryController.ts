import { Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel';
import { ProductCategoryModel } from '../models/ProductCategoryModel';
import { CreateCategorySchema, UpdateCategorySchema, ProductCategorySchema } from '../validation/schemas';
import { z } from 'zod';

const categoryModel = new CategoryModel();
const productCategoryModel = new ProductCategoryModel();

export class CategoryController {
  // Get all categories
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryModel.findAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching categories', error });
    }
  }

  // Get category by ID
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryModel.findById(id);
      
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching category', error });
    }
  }

  // Get category by slug
  async getCategoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await categoryModel.findBySlug(slug);
      
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching category', error });
    }
  }

  // Create a new category
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const categoryData = CreateCategorySchema.parse(req.body);
      const newCategory = await categoryModel.create(categoryData);
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error creating category', error });
      }
    }
  }

  // Update category
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Validate input
      const categoryData = UpdateCategorySchema.parse(req.body);
      const updatedCategory = await categoryModel.update(id, categoryData);
      
      if (!updatedCategory) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating category', error });
      }
    }
  }

  // Delete category
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await categoryModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting category', error });
    }
  }

  // Get products for category
  async getProductsForCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productCategories = await productCategoryModel.getProductsForCategory(id);
      res.status(200).json({ success: true, data: productCategories });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching products for category', error });
    }
  }

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
}