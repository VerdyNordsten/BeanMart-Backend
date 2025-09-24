import type { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { ProductVariantModel } from '../models/ProductVariantModel';
import { VariantImageModel } from '../models/VariantImageModel';
import { AdvancedFileUploadController } from './AdvancedFileUploadController';
import { z } from 'zod';
import type { VariantImage } from '../models/index';

// Schema for creating a product with variants and images
const CreateProductWithVariantsSchema = z.object({
  product: z.object({
    slug: z.string(),
    name: z.string(),
    short_description: z.string().optional(),
    long_description: z.string().optional(),
    currency: z.string().length(3).default('USD'),
    is_active: z.boolean().default(true),
  }),
  variants: z.array(z.object({
    price: z.number(),
    compareAtPrice: z.number().optional(),
    stock: z.number().int().default(0),
    weightGram: z.number().int().optional(),
    isActive: z.boolean().default(true),
    images: z.array(z.object({
      url: z.string().url().optional(),
      imageData: z.string().optional(),
      position: z.number().int().default(1)
    })).optional()
  }))
});

export class CombinedProductController {
  private productModel = new ProductModel();
  private productVariantModel = new ProductVariantModel();
  private variantImageModel = new VariantImageModel();
  private advancedFileUploadController = new AdvancedFileUploadController();

  /**
   * Create a product with its variants and variant images in a single operation
   */
  async createProductWithVariantsAndImages(req: Request, res: Response): Promise<void> {
    try {
      // Validate the input
      const validatedData = CreateProductWithVariantsSchema.parse(req.body);
      
      // Create the product first
      const product = await this.productModel.create(validatedData.product);
      
      // Create each variant and its associated images
      const createdVariants = [];
      for (const variantData of validatedData.variants) {
        // Create the variant
        const variant = await this.productVariantModel.create({
          productId: product.id,
          price: variantData.price,
          compareAtPrice: variantData.compareAtPrice,
          stock: variantData.stock,
          weightGram: variantData.weightGram,
          isActive: variantData.isActive
        });
        
        // Create associated images if any
        const variantImages = [];
        if (variantData.images && variantData.images.length > 0) {
          for (const imageData of variantData.images) {
            // If image data contains a URL, use it directly
            if (imageData.url) {
              const image = await this.variantImageModel.create({
                variantId: variant.id,
                url: imageData.url,
                position: imageData.position
              });
              variantImages.push(image);
            } 
            // If image data contains base64 image data, upload it using advanced upload
            else if (imageData.imageData) {
              // Create a mock request object with the image data
              const mockReq: any = {
                ...req,
                body: {
                  ...req.body,
                  imageData: imageData.imageData,
                  variantId: variant.id,
                  position: imageData.position
                },
                file: null,
                files: null
              };
              
              const mockRes: any = {};
              const result = await new Promise((resolve, reject) => {
                mockRes.status = (code: number) => {
                  const send = (data: any) => {
                    if (code === 201) {
                      resolve(data.data);
                    } else {
                      reject(new Error(data.message || `Upload failed with status ${code}`));
                    }
                  };
                  return { send };
                };
              });
              
              try {
                // Call the advanced file upload controller to process the image data
                await this.advancedFileUploadController.uploadFile(mockReq, mockRes);
              } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                // Continue with other images even if one fails
              }
            }
          }
        }
        
        // Add the variant to the result with its images
        createdVariants.push({
          ...variant,
          images: variantImages
        });
      }
      
      res.status(201).json({ 
        success: true, 
        data: {
          product,
          variants: createdVariants
        },
        message: 'Product with variants and images created successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error creating product with variants and images:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error creating product with variants and images', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Add variants and images to an existing product
   */
  async addVariantsWithImagesToProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id: productId } = req.params;
      
      // Validate that the product exists
      const existingProduct = await this.productModel.findById(productId);
      if (!existingProduct) {
        res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
        return;
      }
      
      // Validate the input
      const variantsDataSchema = z.array(z.object({
        price: z.number(),
        compareAtPrice: z.number().optional(),
        stock: z.number().int().default(0),
        weightGram: z.number().int().optional(),
        isActive: z.boolean().default(true),
        images: z.array(z.object({
          url: z.string().url().optional(),
          imageData: z.string().optional(),
          position: z.number().int().default(1)
        })).optional()
      }));
      
      const validatedVariantsData = variantsDataSchema.parse(req.body);
      
      // Create each variant and its associated images
      const createdVariants = [];
      for (const variantData of validatedVariantsData) {
        // Create the variant
        const variant = await this.productVariantModel.create({
          productId: productId,
          price: variantData.price,
          compareAtPrice: variantData.compareAtPrice,
          stock: variantData.stock,
          weightGram: variantData.weightGram,
          isActive: variantData.isActive
        });
        
        // Create associated images if any
        const variantImages = [];
        if (variantData.images && variantData.images.length > 0) {
          for (const imageData of variantData.images) {
            // If image data contains a URL, use it directly
            if (imageData.url) {
              const image = await this.variantImageModel.create({
                variantId: variant.id,
                url: imageData.url,
                position: imageData.position
              });
              variantImages.push(image);
            } 
            // If image data contains base64 image data, upload it using advanced upload
            else if (imageData.imageData) {
              // Create a mock request object with the image data
              const mockReq: any = {
                ...req,
                body: {
                  ...req.body,
                  imageData: imageData.imageData,
                  variantId: variant.id,
                  position: imageData.position
                },
                file: null,
                files: null
              };
              
              const mockRes: any = {};
              const result = await new Promise((resolve, reject) => {
                mockRes.status = (code: number) => {
                  const send = (data: any) => {
                    if (code === 201) {
                      resolve(data.data);
                    } else {
                      reject(new Error(data.message || `Upload failed with status ${code}`));
                    }
                  };
                  return { send };
                };
              });
              
              try {
                // Call the advanced file upload controller to process the image data
                await this.advancedFileUploadController.uploadFile(mockReq, mockRes);
              } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                // Continue with other images even if one fails
              }
            }
          }
        }
        
        // Add the variant to the result with its images
        createdVariants.push({
          ...variant,
          images: variantImages
        });
      }
      
      res.status(201).json({ 
        success: true, 
        data: {
          productId,
          variants: createdVariants
        },
        message: 'Variants with images added successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error adding variants with images to product:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error adding variants with images to product', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Get a product with all its variants and images in a single operation
   */
  async getProductWithVariantsAndImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productModel.findById(id);
      
      if (!product) {
        res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
        return;
      }
      
      const variants = await this.productVariantModel.findByProductId(product.id);
      
      res.status(200).json({ 
        success: true, 
        data: {
          ...product,
          variants
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching product with variants and images', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a product with its variants and images in a single operation
   * This method can update the product details, variants, and images
   */
  async updateProductWithVariantsAndImages(req: Request, res: Response): Promise<void> {
    try {
      const { id: productId } = req.params;
      
      // Validate the input - only product data can be updated here
      const updateProductSchema = z.object({
        product: z.object({
          slug: z.string().optional(),
          name: z.string().optional(),
          short_description: z.string().optional(),
          long_description: z.string().optional(),
          currency: z.string().length(3).optional(),
          is_active: z.boolean().optional(),
        }).partial().optional(),
        variants: z.array(z.object({
          id: z.string().uuid(), // Existing variant ID
          price: z.number().optional(),
          compareAtPrice: z.number().optional(),
          stock: z.number().int().optional(),
          weightGram: z.number().int().optional(),
          isActive: z.boolean().optional(),
          images: z.array(z.object({
            id: z.string().uuid().optional(), // Existing image ID (if updating)
            url: z.string().url().optional(),
            imageData: z.string().optional(),
            position: z.number().int().default(1)
          })).optional()
        })).optional()
      });
      
      const validatedData = updateProductSchema.parse(req.body);
      
      // Update product if provided
      let updatedProduct = null;
      if (validatedData.product) {
        updatedProduct = await this.productModel.update(productId, validatedData.product);
        if (!updatedProduct) {
          res.status(404).json({ 
            success: false, 
            message: 'Product not found' 
          });
          return;
        }
      }
      
      // Update variants if provided
      let updatedVariants = [];
      if (validatedData.variants && validatedData.variants.length > 0) {
        for (const variantUpdate of validatedData.variants) {
          // Update the variant
          const updatedVariant = await this.productVariantModel.update(
            variantUpdate.id, 
            {
              price: variantUpdate.price,
              compareAtPrice: variantUpdate.compareAtPrice,
              stock: variantUpdate.stock,
              weightGram: variantUpdate.weightGram,
              isActive: variantUpdate.isActive
            }
          );
          
          if (!updatedVariant) {
            res.status(404).json({ 
              success: false, 
              message: `Variant with ID ${variantUpdate.id} not found` 
            });
            return;
          }
          
          // Process images if provided
          if (variantUpdate.images && variantUpdate.images.length > 0) {
            for (const imageUpdate of variantUpdate.images) {
              if (imageUpdate.id) {
                // Update existing image
                await this.variantImageModel.update(
                  imageUpdate.id,
                  {
                    url: imageUpdate.url || undefined,
                    position: imageUpdate.position
                  }
                );
              } else if (imageUpdate.url) {
                // Create new image
                await this.variantImageModel.create({
                  variantId: updatedVariant.id,
                  url: imageUpdate.url,
                  position: imageUpdate.position
                });
              } 
              // Handle base64 image data
              else if (imageUpdate.imageData) {
                // Create a mock request object with the image data
                const mockReq: any = {
                  ...req,
                  body: {
                    ...req.body,
                    imageData: imageUpdate.imageData,
                    variantId: updatedVariant.id,
                    position: imageUpdate.position
                  },
                  file: null,
                  files: null
                };
                
                const mockRes: any = {};
                const result = await new Promise((resolve, reject) => {
                  mockRes.status = (code: number) => {
                    const send = (data: any) => {
                      if (code === 201) {
                        resolve(data.data);
                      } else {
                        reject(new Error(data.message || `Upload failed with status ${code}`));
                      }
                    };
                    return { send };
                  };
                });
                
                try {
                  // Call the advanced file upload controller to process the image data
                  await this.advancedFileUploadController.uploadFile(mockReq, mockRes);
                } catch (uploadError) {
                  console.error('Error uploading image:', uploadError);
                  // Continue with other images even if one fails
                }
              }
            }
          }
          
          // Get the updated variant with its images
          const variantWithImages = await this.productVariantModel.findById(updatedVariant.id);
          if (variantWithImages) {
            updatedVariants.push(variantWithImages);
          }
        }
      }
      
      // If no specific updates were provided for variants, fetch current ones
      if (updatedVariants.length === 0) {
        updatedVariants = await this.productVariantModel.findByProductId(productId);
      }
      
      // If no product was updated, fetch the current product
      if (!updatedProduct) {
        updatedProduct = await this.productModel.findById(productId);
        if (!updatedProduct) {
          res.status(404).json({ 
            success: false, 
            message: 'Product not found' 
          });
          return;
        }
      }
      
      res.status(200).json({ 
        success: true, 
        data: {
          ...updatedProduct,
          variants: updatedVariants
        },
        message: 'Product with variants and images updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: error.issues 
        });
      } else {
        console.error('Error updating product with variants and images:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error updating product with variants and images', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Delete a product and all its variants and images
   */
  async deleteProductWithVariantsAndImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Get the product to make sure it exists
      const product = await this.productModel.findById(id);
      if (!product) {
        res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
        return;
      }
      
      // Get all variants for this product to delete their images first
      const variants = await this.productVariantModel.findByProductId(id);
      
      // Delete all variant images
      for (const variant of variants) {
        if (variant.images && variant.images.length > 0) {
          for (const image of variant.images as VariantImage[]) {
            await this.variantImageModel.delete(image.id);
          }
        }
      }
      
      // Delete all variants
      for (const variant of variants) {
        await this.productVariantModel.delete(variant.id);
      }
      
      // Finally, delete the product
      const deleted = await this.productModel.delete(id);
      
      if (!deleted) {
        res.status(500).json({ 
          success: false, 
          message: 'Error deleting product' 
        });
        return;
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Product with all variants and images deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting product with variants and images', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}