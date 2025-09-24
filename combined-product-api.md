# Combined Product, Variant, and Image API Documentation

This document describes how to use the new combined product functionality that allows creating products with their variants and images in a single API call.

## Endpoints

### 1. Create Product with Variants and Images

Create a product with its variants and images in a single operation.

**Endpoint:** `POST /api/v1/products/with-variants-and-images`

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "product": {
    "slug": "premium-coffee-beans",
    "name": "Premium Coffee Beans",
    "short_description": "High-quality coffee beans sourced from the best farms",
    "long_description": "Our premium coffee beans are carefully selected and roasted to perfection...",
    "currency": "USD",
    "is_active": true
  },
  "variants": [
    {
      "price": 19.99,
      "compareAtPrice": 24.99,
      "stock": 100,
      "weightGram": 500,
      "isActive": true,
      "images": [
        {
          "url": "https://storage.example.com/products/premium-coffee-500g-front.jpg",
          "position": 1
        },
        {
          "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA==",
          "position": 2
        }
      ]
    },
    {
      "price": 29.99,
      "compareAtPrice": 34.99,
      "stock": 50,
      "weightGram": 1000,
      "isActive": true,
      "images": [
        {
          "url": "https://storage.example.com/products/premium-coffee-1kg-front.jpg",
          "position": 1
        }
      ]
    }
  ]
}
```

### 2. Add Variants and Images to Existing Product

Add new variants and images to an existing product.

**Endpoint:** `POST /api/v1/products/{productId}/add-variants-and-images`

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Request Body:**
```json
[
  {
    "price": 15.99,
    "compareAtPrice": 19.99,
    "stock": 75,
    "weightGram": 250,
    "isActive": true,
    "images": [
      {
        "url": "https://storage.example.com/products/premium-coffee-250g.jpg",
        "position": 1
      }
    ]
  }
]
```

### 3. Get Product with Variants and Images

Retrieve a product with all its variants and images.

**Endpoint:** `GET /api/v1/products/{productId}/with-variants-and-images`

**Headers:**
- `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "premium-coffee-beans",
    "name": "Premium Coffee Beans",
    "short_description": "High-quality coffee beans sourced from the best farms",
    "long_description": "Our premium coffee beans are carefully selected and roasted to perfection...",
    "currency": "USD",
    "is_active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "variants": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "price": 19.99,
        "compareAtPrice": 24.99,
        "stock": 100,
        "weightGram": 500,
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "images": [
          {
            "id": "123e4567-e89b-12d3-a456-426614174002",
            "variantId": "123e4567-e89b-12d3-a456-426614174001",
            "url": "https://storage.example.com/products/premium-coffee-500g-front.jpg",
            "position": 1
          },
          {
            "id": "123e4567-e89b-12d3-a456-426614174003",
            "variantId": "123e4567-e89b-12d3-a456-426614174001",
            "url": "https://storage.example.com/products/premium-coffee-500g-back.jpg",
            "position": 2
          }
        ]
      }
    ]
  }
}
```

### 4. Update Product with Variants and Images

Update a product's information, variants, and images in a single operation.

**Endpoint:** `PUT /api/v1/products/{productId}/with-variants-and-images`

**Headers:**
- `Authorization: Bearer <admin_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "product": {
    "name": "Updated Premium Coffee Beans",
    "is_active": true
  },
  "variants": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "price": 22.99,
      "stock": 90,
      "images": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "url": "https://storage.example.com/products/premium-coffee-500g-updated.jpg",
          "position": 1
        },
        {
          "url": "https://storage.example.com/products/new-additional-image.jpg",
          "position": 3
        }
      ]
    }
  ]
}
```

### 5. Delete Product with Variants and Images

Delete a product and all its variants and images.

**Endpoint:** `DELETE /api/v1/products/{productId}/with-variants-and-images`

**Headers:**
- `Authorization: Bearer <admin_token>`

## Usage Examples

### Example 1: Create Product with Variants and Images (cURL)

```bash
curl -X POST http://localhost:3000/api/v1/products/with-variants-and-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "slug": "premium-coffee-beans",
      "name": "Premium Coffee Beans",
      "short_description": "High-quality coffee beans",
      "currency": "USD",
      "is_active": true
    },
    "variants": [
      {
        "price": 19.99,
        "stock": 100,
        "weightGram": 500,
        "isActive": true,
        "images": [
          {
            "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA==",
            "position": 1
          }
        ]
      }
    ]
  }'
```

### Example 2: Create Product with Variants and Images (JavaScript)

```javascript
const response = await fetch('http://localhost:3000/api/v1/products/with-variants-and-images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product: {
      slug: 'premium-coffee-beans',
      name: 'Premium Coffee Beans',
      short_description: 'High-quality coffee beans',
      currency: 'USD',
      is_active: true
    },
    variants: [
      {
        price: 19.99,
        stock: 100,
        weightGram: 500,
        isActive: true,
        images: [
          {
            imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSn/2wBDAQcHBwoIChMKChMpGhUaKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSn/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA==',
            position: 1
          }
        ]
      }
    ]
  })
});

const result = await response.json();
console.log(result);
```