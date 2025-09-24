import type { VariantImage } from './index';
import pool from '../config/db';
import type { QueryResult } from 'pg';
import { CreateVariantImageSchema, UpdateVariantImageSchema } from '../validation/schemas';
import type { z } from 'zod';
import { deleteFile, extractKeyFromUrl } from '../services/storageService';

export class VariantImageModel {
  // Find images by variant ID
  async findByVariantId(variant_id: string): Promise<VariantImage[]> {
    const query = 'SELECT * FROM variant_images WHERE variant_id = $1 ORDER BY position ASC';
    const result: QueryResult = await pool.query(query, [variant_id]);
    return result.rows;
  }

  // Find image by ID
  async findById(id: string): Promise<VariantImage | null> {
    const query = 'SELECT * FROM variant_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Create a new variant image
  async create(imageData: z.infer<typeof CreateVariantImageSchema>): Promise<VariantImage> {
    // Validate input
    const validatedData = CreateVariantImageSchema.parse(imageData);
    
    const query = `INSERT INTO variant_images (variant_id, url, position) VALUES ($1, $2, $3) RETURNING *`;
    const values = [validatedData.variantId, validatedData.url, validatedData.position];
    
    const result: QueryResult = await pool.query(query, values);
    return result.rows[0];
  }

  // Update a variant image
  async update(id: string, imageData: z.infer<typeof UpdateVariantImageSchema>): Promise<VariantImage | null> {
    // Validate input
    const validatedData = UpdateVariantImageSchema.parse(imageData);
    
    const fields = [];
    const values = [];
    let index = 1;
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        fields.push(`${key} = ${index}`);
        values.push(value);
        index++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    const query = `UPDATE variant_images SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
    const result: QueryResult = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Delete a variant image
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM variant_images WHERE id = $1';
    const result: QueryResult = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Delete a variant image with file cleanup
  async deleteWithFileCleanup(id: string): Promise<boolean> {
    try {
      // First, get the image data to extract the URL
      const image = await this.findById(id);
      if (!image) {
        console.log(`Image with id ${id} not found`);
        return false;
      }

      // Delete from database first
      const deleted = await this.delete(id);
      if (!deleted) {
        console.log(`Failed to delete image with id ${id} from database`);
        return false;
      }

      // If the image has a URL, try to delete the file from storage
      if (image.url) {
        const key = extractKeyFromUrl(image.url);
        if (key) {
          try {
            const fileDeleted = await deleteFile(key);
            if (fileDeleted) {
              console.log(`Successfully deleted file ${key} from storage`);
            } else {
              console.log(`File ${key} not found in storage, but database record was deleted`);
            }
          } catch (fileError) {
            console.log(`File ${key} not found in storage or already deleted:`, fileError);
            // Continue - database record is already deleted
          }
        } else {
          console.log(`Could not extract key from URL: ${image.url} - skipping file deletion`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting image with file cleanup:', error);
      return false;
    }
  }

  // Smart delete - only delete from database if file doesn't exist in storage
  async smartDelete(id: string): Promise<{ success: boolean; message: string; deletedFromStorage: boolean }> {
    try {
      // First, get the image data to extract the URL
      const image = await this.findById(id);
      if (!image) {
        return {
          success: false,
          message: `Image with id ${id} not found`,
          deletedFromStorage: false
        };
      }

      // Check if file exists in storage
      let fileExists = false;
      let deletedFromStorage = false;
      
      if (image.url) {
        const key = extractKeyFromUrl(image.url);
        if (key) {
          try {
            // Try to delete the file first
            const fileDeleted = await deleteFile(key);
            if (fileDeleted) {
              fileExists = true;
              deletedFromStorage = true;
              console.log(`Successfully deleted file ${key} from storage`);
            } else {
              console.log(`File ${key} not found in storage`);
            }
          } catch (fileError) {
            console.log(`File ${key} not found in storage or already deleted:`, fileError);
          }
        }
      }

      // Always delete from database
      const deleted = await this.delete(id);
      if (!deleted) {
        return {
          success: false,
          message: `Failed to delete image with id ${id} from database`,
          deletedFromStorage
        };
      }

      return {
        success: true,
        message: fileExists 
          ? `Image deleted from database and storage` 
          : `Image deleted from database (file not found in storage)`,
        deletedFromStorage
      };
    } catch (error) {
      console.error('Error in smart delete:', error);
      return {
        success: false,
        message: `Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        deletedFromStorage: false
      };
    }
  }
}