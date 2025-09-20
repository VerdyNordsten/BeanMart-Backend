import { Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel';
import { Category } from '../models';

const categoryModel = new CategoryModel();

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
      const categoryData: Omit<Category, 'id'> = req.body;
      const newCategory = await categoryModel.create(categoryData);
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating category', error });
    }
  }

  // Update category
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryData: Partial<Category> = req.body;
      const updatedCategory = await categoryModel.update(id, categoryData);
      
      if (!updatedCategory) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      
      res.status(200).json({ success: true, data: updatedCategory });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating category', error });
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
}