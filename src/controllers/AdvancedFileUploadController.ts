import type { Response } from 'express';
import { uploadFile, generateUniqueFilename } from '../services/storageService';
import { VariantImageModel } from '../models/VariantImageModel';
import { z } from 'zod';
import axios from 'axios';
import type { AdminAuthRequest } from '../middleware/adminAuth';

// Schema for advanced file upload
const AdvancedFileUploadSchema = z.object({
  variant_id: z.string().uuid(),
  position: z.number().int().default(1),
});

export class AdvancedFileUploadController {
  /**
   * Upload a file from different sources (local, URL, base64) and create a variant image
   * @param req - Express request object
   * @param res - Express response object
   */
  async uploadFile(req: AdminAuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.isAdmin) {
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden - Admin access required' 
        });
        return;
      }

      // Get the upload method from request
      let fileBuffer: Buffer;
      let originalName: string;
      let contentType: string;

      // Determine upload method based on request body
      const uploadType = req.body.uploadType || (req.file ? 'file' : req.body.url ? 'url' : req.body.imageData ? 'paste' : 'unknown');
      
      if (req.file || uploadType === 'file') {
        // Local file upload
        if (!req.file) {
          res.status(400).json({ 
            success: false, 
            message: 'No file provided for file upload' 
          });
          return;
        }
        fileBuffer = req.file.buffer;
        originalName = req.file.originalname;
        contentType = req.file.mimetype;
      } else if (req.body.url || req.body.imageUrl || uploadType === 'url') {
        // URL upload
        const url = req.body.url || req.body.imageUrl;
        
        // Validate URL
        try {
          new URL(url);
        } catch {
          res.status(400).json({ 
            success: false, 
            message: 'Invalid URL provided' 
          });
          return;
        }

        // Download file from URL
        try {
          const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Beanmart API)'
            }
          });
          
          // Determine content type from the response
          const responseContentType = response.headers['content-type'] ?? 'application/octet-stream';
          
          // Get file extension from URL if content type is generic
          if (responseContentType === 'application/octet-stream') {
            const urlPath = new URL(url).pathname;
            const ext = urlPath.split('.').pop() ?? '';
            contentType = this.getContentTypeFromExtension(ext);
          } else {
            contentType = responseContentType;
          }
          
          fileBuffer = response.data;
          originalName = this.getFilenameFromUrl(url);
        } catch (error: unknown) {
          res.status(400).json({ 
            success: false, 
            message: 'Failed to download file from URL',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return;
        }
      } else if (req.body.imageData || uploadType === 'paste') {
        // Base64 image data (for paste functionality)
        const imageData = req.body.imageData;
        
        // Validate base64 format
        const base64Regex = /^data:image\/(\w+);base64,([a-zA-Z0-9+/=]+)$/;
        if (!base64Regex.test(imageData)) {
          res.status(400).json({ 
            success: false, 
            message: 'Invalid base64 image data. Expected format: data:image/[type];base64,[data]' 
          });
          return;
        }
        
        // Extract content type and base64 data
        const matches = imageData.match(base64Regex);
        if (!matches || matches.length < 3) {
          res.status(400).json({ 
            success: false, 
            message: 'Invalid base64 image data format' 
          });
          return;
        }
        
        const imageType = matches[1]; // e.g., 'jpeg', 'png', 'gif'
        const base64Data = matches[2];
        
        contentType = `image/${imageType}`;
        fileBuffer = Buffer.from(base64Data, 'base64');
        originalName = `pasted-image.${imageType}`;
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'No file provided. Please provide either a file, URL, or base64 image data' 
        });
        return;
      }

      // Validate file type is an image
      if (!contentType.startsWith('image/')) {
        res.status(400).json({ 
          success: false, 
          message: 'Only image files are allowed' 
        });
        return;
      }

      // Validate file size (max 5MB)
      if (fileBuffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ 
          success: false, 
          message: 'File size exceeds 5MB limit' 
        });
        return;
      }

      // Parse and validate request body
      const parsedPosition = parseInt(req.body.position, 10) ?? 1;
      
      const { variant_id, position } = AdvancedFileUploadSchema.parse({
        variant_id: req.body.variant_id,
        position: parsedPosition,
      });

      // Upload file to storage
      const fileName = generateUniqueFilename(originalName);
      const uploadResult = await uploadFile(
        fileBuffer,
        fileName,
        contentType
      );

      // Save image reference to database using VariantImageModel
      const variantImageModel = new VariantImageModel();
      const variantImage = await variantImageModel.create({
        variant_id: variant_id,
        url: uploadResult.url,
        position,
      });

      res.status(201).json({ 
        success: true, 
        data: variantImage,
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
   * Process multiple files from different sources and create multiple variant images
   * @param req - Express request object
   * @param res - Express response object
   */
  async uploadMultipleFiles(req: AdminAuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (!req.isAdmin) {
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden - Admin access required' 
        });
        return;
      }

      const uploadedVariantImages = [];
      const filesToProcess: Array<{
        buffer: Buffer,
        originalName: string,
        contentType: string
      }> = [];

      // Process local files if present
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          filesToProcess.push({
            buffer: file.buffer,
            originalName: file.originalname,
            contentType: file.mimetype
          });
        }
      }

      // Process URL files if present
      if (req.body.urls && Array.isArray(req.body.urls)) {
        for (const url of req.body.urls) {
          try {
            const response = await axios.get(url, { 
              responseType: 'arraybuffer',
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Beanmart API)'
              }
            });
            
            const responseContentType = response.headers['content-type'] ?? 'application/octet-stream';
            let contentType: string;
            
            if (responseContentType === 'application/octet-stream') {
              const urlPath = new URL(url).pathname;
              const ext = urlPath.split('.').pop() ?? '';
              contentType = this.getContentTypeFromExtension(ext);
            } else {
              contentType = responseContentType;
            }
            
            filesToProcess.push({
              buffer: response.data,
              originalName: this.getFilenameFromUrl(url),
              contentType
            });
          } catch (error: unknown) {
            console.error(`Failed to download file from URL: ${url}`, error);
            continue; // Skip this file and continue with others
          }
        }
      }

      // Process base64 images if present
      if (req.body.imageDataArray && Array.isArray(req.body.imageDataArray)) {
        for (const imageData of req.body.imageDataArray) {
          const base64Regex = /^data:image\/(\w+);base64,([a-zA-Z0-9+/=]+)$/;
          if (!base64Regex.test(imageData)) {
            console.error('Invalid base64 image data format');
            continue; // Skip invalid base64 data
          }
          
          const matches = imageData.match(base64Regex);
          if (!matches || matches.length < 3) {
            console.error('Invalid base64 image data format');
            continue; // Skip invalid base64 data
          }
          
          const imageType = matches[1];
          const base64Data = matches[2];
          
          const contentType = `image/${imageType}`;
          const buffer = Buffer.from(base64Data, 'base64');
          const originalName = `pasted-image.${imageType}`;
          
          filesToProcess.push({
            buffer,
            originalName,
            contentType
          });
        }
      }

      // Validate that we have files to process
      if (filesToProcess.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'No valid files provided' 
        });
        return;
      }

      // Parse and validate request body
      const parsedPosition = parseInt(req.body.position, 10) ?? 1;
      
      const { variant_id } = AdvancedFileUploadSchema.parse({
        variant_id: req.body.variant_id,
        position: parsedPosition,
      });

      // Save image reference to database using VariantImageModel
      const variantImageModel = new VariantImageModel();

      // Upload each file
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        // Validate file type is an image
        if (!file.contentType.startsWith('image/')) {
          res.status(400).json({ 
            success: false, 
            message: `File at position ${i + 1} is not an image` 
          });
          return;
        }

        // Validate file size (max 5MB)
        if (file.buffer.length > 5 * 1024 * 1024) {
          res.status(400).json({ 
            success: false, 
            message: `File at position ${i + 1} exceeds 5MB limit` 
          });
          return;
        }

        // Calculate position for this file
        const filePosition = req.body.positions && Array.isArray(req.body.positions)
          ? (parseInt(req.body.positions[i], 10) ?? i + 1)
          : parsedPosition + i;

        // Upload file to storage
        const fileName = generateUniqueFilename(file.originalName);
        const uploadResult = await uploadFile(
          file.buffer,
          fileName,
          file.contentType
        );

        // Save image reference to database
        const variantImage = await variantImageModel.create({
          variant_id: variant_id,
          url: uploadResult.url,
          position: filePosition,
        });

        uploadedVariantImages.push(variantImage);
      }

      res.status(201).json({ 
        success: true, 
        data: uploadedVariantImages,
        message: `${uploadedVariantImages.length} variant images uploaded successfully`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error uploading multiple variant images:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error uploading multiple variant images', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Helper method to determine content type from file extension
   */
  private getContentTypeFromExtension(ext: string): string {
    const extensionMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff'
    };
    
    return extensionMap[ext.toLowerCase()] ?? 'application/octet-stream';
  }

  /**
   * Helper method to extract filename from URL
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() ?? 'downloaded-file';
      return filename ?? 'downloaded-file';
    } catch {
      return 'downloaded-file';
    }
  }
}