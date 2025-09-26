import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

// Validate required environment variables
const requiredEnvVars = [
  'STORAGE_ENDPOINT',
  'STORAGE_REGION',
  'STORAGE_ACCESS_KEY',
  'STORAGE_SECRET_KEY',
  'STORAGE_BUCKET_NAME',
  'STORAGE_PUBLIC_ENDPOINT'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configure S3 client for MinIO or other S3-compatible storage
const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT!,
  region: process.env.STORAGE_REGION!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true, // Needed for MinIO and most S3-compatible services
  maxAttempts: 3, // Retry failed requests up to 3 times
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3/MinIO storage
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to save the file as
 * @param contentType - The MIME type of the file
 * @returns Promise<UploadResult> - The URL and key of the uploaded file
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> => {
  const maxRetries = 3;
  const timeoutMs = 120000; // 2 minutes timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Validate required environment variables
      if (!process.env.STORAGE_BUCKET_NAME) {
        throw new Error('STORAGE_BUCKET_NAME environment variable is not set');
      }
      
      if (!process.env.STORAGE_PUBLIC_ENDPOINT) {
        throw new Error('STORAGE_PUBLIC_ENDPOINT environment variable is not set');
      }

      // Generate a unique key for the file using UUIDv4
      const uniqueFilename = generateUniqueFilename(fileName);
      const key = `product-images/${uniqueFilename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.STORAGE_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      });

      // Create timeout promise to prevent hanging on slow connections
      const uploadPromise = s3Client.send(command);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      await Promise.race([uploadPromise, timeoutPromise]);

      // Generate the public URL using the public endpoint
      const url = `${process.env.STORAGE_ENDPOINT}/${process.env.STORAGE_BUCKET_NAME}/${key}`;

      console.log(`Successfully uploaded file after attempt ${attempt}`);
      return { url, key };
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;
      
      if (isLastAttempt) {
        console.error('Error uploading file after all retries:', error);
        throw new Error(`Failed to upload file after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // For retry, add exponential delay
      if (error instanceof Error && 
          (error.message.includes('timeout') || 
           error.message.includes('ETIMEDOUT') || 
           error.message.includes('ENOTFOUND'))) {
        const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`Retrying upload after attempt ${attempt}. Waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // For non-timeout errors, fail immediately
        throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  // This shouldn't reach here but just in case
  throw new Error('Unexpected error in upload retry loop');
};

/**
 * Delete a file from S3/MinIO storage
 * @param key - The key of the file to delete
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    // Validate required environment variable
    if (!process.env.STORAGE_BUCKET_NAME) {
      throw new Error('STORAGE_BUCKET_NAME environment variable is not set');
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Generate a unique filename
 * @param originalName - The original filename
 * @returns string - A unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const fileExtension = originalName.split('.').pop() ?? '';
  const uuid = uuidv4();
  return `${uuid}.${fileExtension}`;
};

/**
 * Extract the storage key from a public URL
 * @param url - The public URL of the file
 * @returns string | null - The storage key or null if URL is invalid
 */
export const extractKeyFromUrl = (url: string): string | null => {
  try {
    // Check if it's a storage URL
    const storageEndpoint = process.env.STORAGE_ENDPOINT;
    const bucketName = process.env.STORAGE_BUCKET_NAME;
    
    if (!storageEndpoint || !bucketName) {
      return null;
    }
    
    // Expected URL format: {STORAGE_ENDPOINT}/{BUCKET_NAME}/{key}
    const expectedPrefix = `${storageEndpoint}/${bucketName}/`;
    
    if (url.startsWith(expectedPrefix)) {
      return url.substring(expectedPrefix.length);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
};

export { s3Client };