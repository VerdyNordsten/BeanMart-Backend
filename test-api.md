# API Testing Documentation

## Variant Images with Advanced Upload

The variant images API now supports advanced upload methods in addition to the traditional local file upload.

### Traditional Endpoints

#### 1. Single Local File Upload
```bash
curl -X POST http://localhost:3000/api/v1/variant-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "variantId=123e4567-e89b-12d3-a456-426614174000" \
  -F "position=1"
```

#### 2. Multiple Local File Upload
```bash
curl -X POST http://localhost:3000/api/v1/variant-images/multiple \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.png" \
  -F "variantId=123e4567-e89b-12d3-a456-426614174000" \
  -F "position=1"
```

### Advanced Endpoints

#### 1. Advanced Single File Upload (Local, URL, or Base64)
```bash
curl -X POST http://localhost:3000/api/v1/variant-images/upload-advanced \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "url=https://example.com/image.jpg" \
  -F "variantId=123e4567-e89b-12d3-a456-426614174000" \
  -F "position=1"
```

Alternative for base64 image data:
```bash
curl -X POST http://localhost:3000/api/v1/variant-images/upload-advanced \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
    "variantId": "123e4567-e89b-12d3-a456-426614174000",
    "position": 1
  }'
```

Alternative for local file (multipart):
```bash
curl -X POST http://localhost:3000/api/v1/variant-images/upload-advanced \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "variantId=123e4567-e89b-12d3-a456-426614174000" \
  -F "position=1"
```

#### 2. Advanced Multiple File Upload (Mixed methods)
```bash
curl -X POST http://localhost:3000/api/v1/variant-images/upload-advanced-multiple \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/image2.jpg"
    ],
    "imageDataArray": [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
    ],
    "variantId": "123e4567-e89b-12d3-a456-426614174000",
    "position": 1
  }'
```

## Expected Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "variantId": "123e4567-e89b-12d3-a456-426614174001",
    "url": "https://storage.example.com/bucket/product-images/unique-filename.jpg",
    "position": 1,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Variant image uploaded successfully"
}
```

For multiple uploads, "data" will be an array of variant image objects.

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```