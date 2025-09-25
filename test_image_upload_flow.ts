import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

async function testImageUploadFlow() {
  console.log('🧪 Testing Image Upload Flow...\n');

  try {
    // 1. First, create a product
    console.log('1. Creating product...');
    const productData = {
      slug: `test-product-${Date.now()}`,
      name: 'Test Product for Image Upload',
      short_description: 'Testing image upload flow',
      long_description: 'This product is created to test image upload functionality',
      currency: 'USD',
      is_active: true
    };

    const productResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!productResponse.data.success) {
      throw new Error('Failed to create product');
    }

    const productId = productResponse.data.data.id;
    console.log('✅ Product created:', productId);

    // 2. Create a variant
    console.log('\n2. Creating variant...');
    const variantData = {
      product_id: productId,
      price: 19.99,
      stock: 100,
      isActive: true
    };

    const variantResponse = await axios.post(`${API_BASE_URL}/product-variants`, variantData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!variantResponse.data.success) {
      throw new Error('Failed to create variant');
    }

    const variantId = variantResponse.data.data.id;
    console.log('✅ Variant created:', variantId);

    // 3. Test file upload
    console.log('\n3. Testing file upload...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path.join(__dirname, 'coffe-image.jpeg')));
    formData.append('variantId', variantId);
    formData.append('position', '1');
    formData.append('uploadType', 'file');

    const fileUploadResponse = await axios.post(
      `${API_BASE_URL}/variant-images/upload-advanced`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );

    console.log('File upload response:', fileUploadResponse.data);

    // 4. Test URL upload
    console.log('\n4. Testing URL upload...');
    const urlFormData = new FormData();
    urlFormData.append('url', 'https://cdn.pixabay.com/photo/2015/03/26/09/46/coffee-690157_1280.jpg');
    urlFormData.append('variantId', variantId);
    urlFormData.append('position', '2');
    urlFormData.append('uploadType', 'url');

    const urlUploadResponse = await axios.post(
      `${API_BASE_URL}/variant-images/upload-advanced`,
      urlFormData,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          ...urlFormData.getHeaders()
        }
      }
    );

    console.log('URL upload response:', urlUploadResponse.data);

    // 5. Test base64 upload
    console.log('\n5. Testing base64 upload...');
    const base64FormData = new FormData();
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    base64FormData.append('imageData', base64Image);
    base64FormData.append('variantId', variantId);
    base64FormData.append('position', '3');
    base64FormData.append('uploadType', 'paste');

    const base64UploadResponse = await axios.post(
      `${API_BASE_URL}/variant-images/upload-advanced`,
      base64FormData,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          ...base64FormData.getHeaders()
        }
      }
    );

    console.log('Base64 upload response:', base64UploadResponse.data);

    // 6. Get variant with images
    console.log('\n6. Getting variant with images...');
    const variantWithImagesResponse = await axios.get(`${API_BASE_URL}/product-variants/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('Variant with images:', variantWithImagesResponse.data);

    console.log('\n✅ All upload tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Error during upload flow test:', error.response?.data || error.message);
  }
}

// Run the test
testImageUploadFlow();

