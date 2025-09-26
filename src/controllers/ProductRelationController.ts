import type { Request, Response } from 'express';
import { ProductCategoryModel } from '../models/ProductCategoryModel';
import { ProductRoastLevelModel } from '../models/ProductRoastLevelModel';
import { z } from 'zod';

const productCategoryModel = new ProductCategoryModel();
const productRoastLevelModel = new ProductRoastLevelModel();

// Schema for updating product relations
const UpdateProductRelationsSchema = z.object({
  categories: z.array(z.string()).optional(),
  roastLevels: z.array(z.string()).optional(),
});

export class ProductRelationController {
  // Update product categories and roast levels
  async updateProductRelations(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const { categories, roastLevels } = UpdateProductRelationsSchema.parse(req.body);

      // Update categories if provided
      if (categories !== undefined) {
        // First, remove all existing categories for this product
        await productCategoryModel.removeAllCategoriesFromProduct(productId);
        
        // Then add new categories
        for (const categoryId of categories) {
          await productCategoryModel.addCategoryToProduct({
            productId,
            categoryId,
          });
        }
      }

      // Update roast levels if provided
      if (roastLevels !== undefined) {
        // First, remove all existing roast levels for this product
        await productRoastLevelModel.removeAllRoastLevelsFromProduct(productId);
        
        // Then add new roast levels
        for (const roastLevelId of roastLevels) {
          await productRoastLevelModel.addRoastLevelToProduct({
            productId,
            roastLevelId,
          });
        }
      }

      res.status(200).json({ 
        success: true, 
        message: 'Product relations updated successfully' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      } else {
        res.status(500).json({ success: false, message: 'Error updating product relations', error });
      }
    }
  }

  // Get product relations
  async getProductRelations(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      
      const categories = await productCategoryModel.getCategoriesForProduct(productId);
      const roastLevels = await productRoastLevelModel.getRoastLevelsForProduct(productId);

      res.status(200).json({ 
        success: true, 
        data: { 
          categories, 
          roastLevels 
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching product relations', error });
    }
  }
}
