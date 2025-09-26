import sharp from 'sharp';

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface ProcessedImageResult {
  buffer: Buffer;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  wasResized: boolean;
}

/**
 * Process and resize image if needed
 * @param imageBuffer - The image buffer to process
 * @param options - Options for processing
 * @returns ProcessedImageResult containing processed buffer and dimensions
 */
export const processImage = async (
  imageBuffer: Buffer, 
  options: ImageResizeOptions = {}
): Promise<ProcessedImageResult> => {
  const {
    maxWidth = 700,
    maxHeight = 700,
    quality = 90
  } = options;

  try {
    // Get image metadata first
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Check if resizing is needed
    const needsResizing = originalWidth > maxWidth || originalHeight > maxHeight;
    
    if (!needsResizing) {
      // Image is already within size limit, return as-is
      console.log(`Image ${originalWidth}x${originalHeight} is within limits, no resizing needed`);
      return {
        buffer: imageBuffer,
        width: originalWidth,
        height: originalHeight,
        originalWidth,
        originalHeight,
        wasResized: false
      };
    }

    console.log(`Resizing image from ${originalWidth}x${originalHeight} to max ${maxWidth}x${maxHeight}`);

    // Resize image while maintaining aspect ratio
    let sharpProcessor = sharp(imageBuffer).resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside', // Maintain aspect ratio and fit inside dimensions
      withoutEnlargement: true // Don't upscale smaller images
    });

    // Convert to JPEG for consistency
    const resizedBuffer = await sharpProcessor
      .jpeg({ 
        quality,
        progressive: true // For better loading
      })
      .toBuffer({ resolveWithObject: true });

    // Get new dimensions
    const newMetadata = await sharp(resizedBuffer.data).metadata();
    const newWidth = newMetadata.width || maxWidth;
    const newHeight = newMetadata.height || maxHeight;

    console.log(`Resized image to ${newWidth}x${newHeight}`);

    return {
      buffer: resizedBuffer.data,
      width: newWidth,
      height: newHeight,
      originalWidth,
      originalHeight,
      wasResized: true
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get image metadata without processing
 * @param imageBuffer - The image buffer to analyze
 * @returns Image metadata
 */
export const getImageMetadata = async (imageBuffer: Buffer) => {
  return await sharp(imageBuffer).metadata();
};

/**
 * Convert image to specific format
 * @param imageBuffer - The image buffer to convert
 * @param format - Target format (jpeg, png, webp)
 * @param options - Options for conversion
 * @returns Processed buffer
 */
export const convertImageFormat = async (
  imageBuffer: Buffer,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg',
  options: { quality?: number } = {}
): Promise<Buffer> => {
  const { quality = 90 } = options;
  
  let sharpInstance = sharp(imageBuffer);
  
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, progressive: true });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality, effort: 6 });
      break;
  }
  
  return await sharpInstance.toBuffer();
};
