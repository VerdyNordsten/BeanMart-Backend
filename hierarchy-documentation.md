# Data Hierarchy in Combined Product Management

This document explains how data flows through the combined product management system, following the hierarchy: Product → ProductVariant → VariantImage.

## Overview

The combined product system enables managing products, their variants, and their images in a single atomic operation while maintaining proper parent-child relationships:

1. **Product** (parent)
   - Contains general product information
   - Owns multiple variants

2. **ProductVariant** (child of Product)
   - Contains variant-specific information (price, stock, etc.)
   - Owns multiple images

3. **VariantImage** (child of ProductVariant)
   - Contains image-specific information (URL, position, etc.)
   - Belongs to a single variant

## Data Flow Process

### 1. Creation Process

When using the `POST /api/v1/products/with-variants-and-images` endpoint:

1. **Product Creation**:
   - Product data is validated and inserted into the `products` table
   - Returns the newly created product with its UUID

2. **Variant Creation** (for each variant):
   - Product variant data is validated and inserted into the `product_variants` table
   - The `product_id` field references the parent product's UUID
   - Returns the newly created variant with its UUID

3. **Image Creation** (for each image):
   - Variant image data is validated and inserted into the `variant_images` table
   - The `variant_id` field references the parent variant's UUID
   - Returns the newly created image with its UUID

### 2. Data Relationships

The database relationships are:

- `product_variants.product_id` → `products.id`
- `variant_images.variant_id` → `product_variants.id`

### 3. Example Request Structure

```json
{
  "product": {
    "slug": "premium-coffee-beans",
    "name": "Premium Coffee Beans",
    "short_description": "High-quality coffee beans",
    "currency": "USD",
    "is_active": true
  },
  "variants": [
    {
      "price": 29.99,
      "stock": 100,
      "weightGram": 500,
      "isActive": true,
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "position": 1
        },
        {
          "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
          "position": 2
        }
      ]
    }
  ]
}
```

### 4. Resulting Hierarchy

After successful creation:

- **Product**: 
  - ID: `123e4567-e89b-12d3-a456-426614174000`
  - Name: "Premium Coffee Beans"

- **ProductVariant**: (child of above product)
  - ID: `123e4567-e89b-12d3-a456-426614174001`
  - Price: 29.99
  - Product ID: `123e4567-e89b-12d3-a456-426614174000`
  
- **VariantImage 1**: (child of above variant)
  - ID: `123e4567-e89b-12d3-a456-426614174002`
  - URL: "https://example.com/image1.jpg"
  - Variant ID: `123e4567-e89b-12d3-a456-426614174001`
  - Position: 1

- **VariantImage 2**: (child of above variant)
  - ID: `123e4567-e89b-12d3-a456-426614174003`
  - (Uploaded from base64 data)
  - Variant ID: `123e4567-e89b-12d3-a456-426614174001`
  - Position: 2

## Key Benefits

1. **Atomic Operations**: All related data is created in a single request
2. **Consistency**: Parent-child relationships are maintained through foreign keys
3. **Flexibility**: Supports both direct URLs and base64 image data
4. **Efficiency**: Reduces the number of API calls needed to create a complete product
5. **Hierarchical Integrity**: The parent-child relationships are properly maintained in the database

## API Endpoints

- `POST /api/v1/products/with-variants-and-images` - Create product with variants and images
- `POST /api/v1/products/{id}/add-variants-and-images` - Add variants and images to existing product
- `GET /api/v1/products/{id}/with-variants-and-images` - Retrieve product with all variants and images
- `PUT /api/v1/products/{id}/with-variants-and-images` - Update product with variants and images
- `DELETE /api/v1/products/{id}/with-variants-and-images` - Delete product with all variants and images

This design ensures that the data hierarchy is properly maintained from product down to individual images, creating a complete and consistent product catalog in a single operation.