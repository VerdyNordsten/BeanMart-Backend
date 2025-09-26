import type { Response } from 'express';
import { uploadFile, generateUniqueFilename } from '../services/storageService';
import { processImage } from '../services/imageProcessingService';
import { VariantImageModel } from '../models/VariantImageModel';
import { z } from 'zod';
import axios from 'axios';
import type { AdminAuthRequest } from '../middleware/adminAuth';

// Configure axios defaults for better timeout handling
const axiosInstance = axios.create({
  timeout: 60000, // 60 seconds timeout
  maxContentLength: 50 * 1024 * 1024, // Max 50MB files
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Beanmart API)',
    'Accept': 'image/*', // Accept all image types
    'Cache-Control': 'no-cache' // Don't cache during download
  }
});

// Helper function to download file with retry logic
const downloadImageWithRetry = async (url: string, maxRetries: number = 3): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to download ${url} (attempt ${attempt}/${maxRetries})`);
      const response = await axiosInstance.get(url, { 
        responseType: 'arraybuffer'
      });
      console.log(`Successfully downloaded ${url}`);
      return response;
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;
      
      if (isLastAttempt) {
        throw error; // Re-throw on final attempt
      }
      
      // For retry, add slight delay
      if (error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('ECONNABORTED'))) {
        console.log(`Timeout on attempt ${attempt}, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error; // For other errors, don't retry
      }
    }
  }
};

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
      let fileBuffer: Buffer | undefined;
      let originalName: string | undefined;
      let contentType: string | undefined;

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
          const response = await downloadImageWithRetry(url);
          
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
          console.error('Error downloading file from URL:', error);
          
          let errorMessage = 'Failed to download file from URL';
          if (error instanceof Error) {
            const errorWithCode = error as any;
            if (errorWithCode.code === 'ECONNABORTED' || error.message.includes('timeout')) {
              errorMessage = 'Download timeout - Image took too long to download. Please try a different image or check your internet connection.';
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
              errorMessage = 'Failed to connect to image server. Please check the URL.';
            } else if (error.message.includes('ENOENT') || error.message.includes('404')) {
              errorMessage = 'Image not found at the provided URL.';
            } else {
              errorMessage = `Download error: ${error.message}`;
            }
          }
          
          res.status(400).json({ 
            success: false, 
            message: errorMessage,
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

      // Check that all required variables are properly set
      if (!fileBuffer || !originalName || !contentType) {
        res.status(400).json({ 
          success: false, 
          message: 'Unable to determine file content or metadata from upload' 
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

      // Validate file size (max 50MB)
      if (fileBuffer.length > 50 * 1024 * 1024) {
        res.status(400).json({ 
          success: false, 
          message: 'File size exceeds 50MB limit' 
        });
        return;
      }

      // Parse and validate request body
      const parsedPosition = parseInt(req.body.position, 10) ?? 1;
      
      const { variant_id, position } = AdvancedFileUploadSchema.parse({
        variant_id: req.body.variant_id,
        position: parsedPosition,
      });

      // Process/resize image to maximum 700x700 if needed
      let processedBuffer = fileBuffer;
      try {
        const processedImage = await processImage(fileBuffer, {
          maxWidth: 700,
          maxHeight: 700,
          quality: 90
        });
        
        processedBuffer = processedImage.buffer;
        
        // Log image processing results
        if (processedImage.wasResized) {
          console.log(`Image resized from ${processedImage.originalWidth}x${processedImage.originalHeight} to ${processedImage.width}x${processedImage.height}`);
        } else {
          console.log(`Image size ${processedImage.width}x${processedImage.height} is within limits, keeping original`);
        }
        
        // Update content type to JPEG since resized images are converted to JPEG for consistency
        if (processedImage.wasResized && processedImage.width <= 700 && processedImage.height <= 700) {
          contentType = 'image/jpeg';
        }
      } catch (processingError) {
        console.error('Error processing image during resize:', processingError);
        // Continue with original if processing fails
        console.log('Continuing with original image due to processing error');
      }

      // Upload file to storage
      const fileName = generateUniqueFilename(originalName);
      const uploadResult = await uploadFile(
        processedBuffer,
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
            const response = await downloadImageWithRetry(url);
            
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
            
            // Provide more specific error messages in logs
            if (error instanceof Error) {
              const errorWithCode = error as any;
              if (errorWithCode.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.error(`Timeout downloading ${url}: Image took too long to download`);
              } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                console.error(`Connection error for ${url}: Failed to connect to image server`);
              } else if (error.message.includes('ENOENT') || error.message.includes('404')) {
                console.error(`Not found error for ${url}: Image not found at URL`);
              }
            }
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

        // Validate file size (max 50MB)
        if (file.buffer.length > 50 * 1024 * 1024) {
          res.status(400).json({ 
            success: false, 
            message: `File at position ${i + 1} exceeds 50MB limit` 
          });
          return;
        }

        // Calculate position for this file
        const filePosition = req.body.positions && Array.isArray(req.body.positions)
          ? (parseInt(req.body.positions[i], 10) ?? i + 1)
          : parsedPosition + i;

        // Process/resize image to maximum 700x700 if needed
        let processedBuffer = file.buffer;
        let processedContentType = file.contentType;
        
        try {
          const processedImage = await processImage(file.buffer, {
            maxWidth: 700,
            maxHeight: 700,
            quality: 90
          });
          
          processedBuffer = processedImage.buffer;
          
          // Log image processing results
          if (processedImage.wasResized) {
            console.log(`File ${i + 1}: Resized from ${processedImage.originalWidth}x${processedImage.originalHeight} to ${processedImage.width}x${processedImage.height}`);
          } else {
            console.log(`File ${i + 1}: Size ${processedImage.width}x${processedImage.height} is within limits, keeping original`);
          }
          
          // Update content type to JPEG since resized images are converted to JPEG for consistency
          if (processedImage.wasResized && processedImage.width <= 700 && processedImage.height <= 700) {
            processedContentType = 'image/jpeg';
          }
        } catch (processingError) {
          console.error(`Error processing file ${i + 1} during resize:`, processingError);
          // Continue with original if processing fails
          console.log(`Continuing with original file ${i + 1} due to processing error`);
        }

        // Upload file to storage
        const fileName = generateUniqueFilename(file.originalName);
        const uploadResult = await uploadFile(
          processedBuffer,
          fileName,
          processedContentType
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