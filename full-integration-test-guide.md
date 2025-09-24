# Full Integration Test: Product → Variant → Images

This document provides a detailed guide on how to run the full integration test that verifies data flows correctly from product to variant to images, both in the database and storage system.

## Prerequisites

1. A running instance of the BeanMart backend server
2. An admin account with appropriate privileges
3. Access to the database to verify entries
4. Access to the storage system (MinIO/S3) to verify image uploads

## Step 1: Obtain Admin Token

First, you need to get an admin token using the authentication API:

```bash
# Register an admin user (if needed)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_secure_password",
    "fullName": "Admin User"
  }'

# Or login with an existing admin account
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_secure_password"
  }'
```

The response will contain a JWT token that you'll use for authorization.

## Step 2: Run the Integration Test

Once you have the admin token, run the test script:

```bash
# Set the admin token as an environment variable
export ADMIN_TOKEN="your_jwt_token_here"
node test-full-integration.js
```

## Step 3: Verify Database Entries

After the test runs, you can verify entries in the database:

```sql
-- Check products
SELECT * FROM products WHERE name LIKE '%Integration Test Product%';

-- Check variants for a specific product
SELECT * FROM product_variants WHERE product_id = 'your_product_id';

-- Check images for a specific variant
SELECT * FROM variant_images WHERE variant_id = 'your_variant_id';
```

## Step 4: Verify Storage System

Check that images were uploaded to your storage system (MinIO/S3):
1. Access your MinIO web interface or S3 console
2. Navigate to the configured bucket (likely "beanmart")
3. Look for image files in the "product-images" folder
4. Verify the URLs from the database point to valid images

## Expected Test Flow

The test follows this flow:

1. **Individual Image Upload Test**:
   - Uploads an image to verify storage functionality
   - Confirms the image is accessible via its URL

2. **Product Creation**:
   - Creates a product with 2 variants
   - Each variant has images (both URL and base64 data types)
   - Confirms database entries with proper foreign keys

3. **Data Verification**:
   - Retrieves the created product with all variants and images
   - Verifies the hierarchy: Product → ProductVariant → VariantImage
   - Checks that all image URLs are accessible

4. **Additional Variants Test**:
   - Adds more variants to the existing product
   - Verifies the expanded hierarchy

5. **Final Verification**:
   - Ensures total counts match expected values
   - Confirms all relationships are maintained

## Expected Database Schema Validation

The system maintains proper foreign key relationships:

- `product_variants.product_id` references `products.id`
- `variant_images.variant_id` references `product_variants.id`

## Expected Storage Validation

Images uploaded via base64 or URL should be stored in your configured storage system:

- Images are saved with unique UUID filenames
- Public URLs are generated that point to the stored images
- Images are accessible via HTTPS URLs

## Troubleshooting

If the test fails:

1. **Token Issues**: Verify the admin token is valid and has admin privileges
2. **Database Issues**: Check that the database is properly connected and configured
3. **Storage Issues**: Verify storage credentials (MinIO/S3) are correctly configured in environment variables
4. **Network Issues**: Ensure the server is running and accessible

## Success Criteria

A successful test will show:
- ✅ Product created in the database
- ✅ Variants created with correct foreign key references to the product
- ✅ Images created with correct foreign key references to their variants
- ✅ Images uploaded to storage system and accessible via their URLs
- ✅ Complete hierarchy maintained: Product → ProductVariant → VariantImage
- ✅ All data retrievable via API endpoints

## Manual API Test

If you prefer to test manually, here's the complete API flow:

1. Create combined product:
```bash
curl -X POST http://localhost:3000/api/v1/products/with-variants-and-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "slug": "test-product-123",
      "name": "Test Product 123",
      "short_description": "Integration test product",
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
            "url": "https://via.placeholder.com/300x300.png",
            "position": 1
          }
        ]
      }
    ]
  }'
```

2. Retrieve the created product:
```bash
curl -X GET http://localhost:3000/api/v1/products/PRODUCT_ID/with-variants-and-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

This will verify that the complete hierarchy works correctly from product creation through image storage and database relationships.