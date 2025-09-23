import type { Response } from 'express';
import { uploadFile, generateUniqueFilename } from '../services/storageService';
import { VariantImageModel } from '../models/VariantImageModel';
import { z } from 'zod';
import type { AdminAuthRequest } from '../middleware/adminAuth';

const variantImageModel = new VariantImageModel();

// Schema for variant image upload
export const VariantImageUploadSchema = z.object({
  variantId: z.string().uuid(),
  position: z.number().int().default(1),
});

export class FileUploadController {
  /**
   * Upload a variant image
   * @param req - Express request object
   * @param res - Express response object
   */
  async uploadVariantImage(req: AdminAuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.isAdmin) {
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden - Admin access required' 
        });
        return;
      }

      // Validate file upload
      if (!req.file) {
        res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
        return;
      }

      // Parse and validate request body
      const parsedPosition = parseInt(req.body.position, 10) || 1;
      
      const { variantId, position } = VariantImageUploadSchema.parse({
        variantId: req.body.variantId,
        position: parsedPosition,
      });

      // Upload file to storage
      const fileName = generateUniqueFilename(req.file.originalname);
      const uploadResult = await uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      // Save image reference to database
      const variantImage = await variantImageModel.create({
        variantId,
        url: uploadResult.url,
        position,
      });

      res.status(201).json({ 
        success: true, 
        data: {
          ...variantImage,
          storageKey: uploadResult.key
        },
        message: 'Variant image uploaded successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error uploading variant image:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error uploading variant image', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Upload multiple variant images
   * @param req - Express request object
   * @param res - Express response object
   */
  async uploadVariantImages(req: AdminAuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.isAdmin) {
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden - Admin access required' 
        });
        return;
      }

      // Validate files upload
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'No files uploaded' 
        });
        return;
      }

      // Parse and validate request body
      const parsedPosition = parseInt(req.body.position, 10) || 1;
      
      const { variantId } = VariantImageUploadSchema.parse({
        variantId: req.body.variantId,
        position: parsedPosition,
      });

      const uploadedImages = [];
      
      // Upload each file
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Parse position for this specific file, fallback to index + 1
        const filePosition = (req.body.positions && Array.isArray(req.body.positions)) 
          ? (parseInt(req.body.positions[i], 10) || i + 1)
          : (parseInt(req.body.position, 10) || i + 1);
        
        // Upload file to storage
        const fileName = generateUniqueFilename(file.originalname);
        const uploadResult = await uploadFile(
          file.buffer,
          fileName,
          file.mimetype
        );

        // Save image reference to database
        const variantImage = await variantImageModel.create({
          variantId,
          url: uploadResult.url,
          position: filePosition,
        });

        uploadedImages.push({
          ...variantImage,
          storageKey: uploadResult.key
        });
      }

      res.status(201).json({ 
        success: true, 
        data: uploadedImages,
        message: `${uploadedImages.length} variant images uploaded successfully`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error uploading variant images:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error uploading variant images', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}