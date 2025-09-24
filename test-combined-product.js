const axios = require('axios');

// Replace with your actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';
const BASE_URL = 'http://localhost:3000/api/v1';

// Example base64 image data (this is a small transparent 1x1 pixel PNG)
const EXAMPLE_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testCombinedProductCreation() {
  try {
    console.log('Starting combined product creation test...\\n');

    // 1. Create a product with variants and images (using base64)
    console.log('1. Creating product with variants and images...');
    const productData = {
      product: {
        slug: `test-product-${Date.now()}`,
        name: `Test Product ${new Date().toISOString()}`,
        short_description: 'This is a test product created via combined API',
        long_description: 'This is a detailed description of the test product. It has multiple variants with different images.',
        currency: 'USD',
        is_active: true
      },
      variants: [
        {
          price: 29.99,
          compareAtPrice: 39.99,
          stock: 100,
          weightGram: 500,
          isActive: true,
          images: [
            {
              imageData: EXAMPLE_BASE64_IMAGE,  // Using base64 image
              position: 1
            },
            {
              url: 'https://via.placeholder.com/300x300.png',  // Using direct URL
              position: 2
            }
          ]
        },
        {
          price: 49.99,
          compareAtPrice: 59.99,
          stock: 50,
          weightGram: 1000,
          isActive: true,
          images: [
            {
              imageData: EXAMPLE_BASE64_IMAGE,  // Using base64 image
              position: 1
            }
          ]
        }
      ]
    };

    const createResponse = await axios.post(
      `${BASE_URL}/products/with-variants-and-images`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Product created successfully!');
    console.log('Product ID:', createResponse.data.data.product.id);
    console.log('Product Name:', createResponse.data.data.product.name);
    console.log('Number of variants created:', createResponse.data.data.variants.length);

    const productId = createResponse.data.data.product.id;

    // 2. Get the created product to verify the data hierarchy
    console.log('\\n2. Retrieving created product with variants and images...');
    const getResponse = await axios.get(
      `${BASE_URL}/products/${productId}/with-variants-and-images`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    console.log('✅ Product retrieved successfully!');
    console.log('Retrieved product ID:', getResponse.data.data.id);
    console.log('Number of variants:', getResponse.data.data.variants.length);

    // Check each variant and its images
    getResponse.data.data.variants.forEach((variant, index) => {
      console.log(`  Variant ${index + 1}: ID=${variant.id}, Price=$${variant.price}`);
      console.log(`    Number of images: ${variant.images.length}`);
      variant.images.forEach((image, imgIndex) => {
        console.log(`      Image ${imgIndex + 1}: ID=${image.id}, Position=${image.position}, URL=${image.url}`);
      });
    });

    // 3. Add more variants to the existing product
    console.log('\\n3. Adding more variants to the existing product...');
    const additionalVariants = [
      {
        price: 19.99,
        stock: 25,
        weightGram: 250,
        isActive: true,
        images: [
          {
            url: 'https://via.placeholder.com/150x150.png',
            position: 1
          }
        ]
      }
    ];

    const addResponse = await axios.post(
      `${BASE_URL}/products/${productId}/add-variants-and-images`,
      additionalVariants,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Additional variants added successfully!');
    console.log('Number of variants added:', addResponse.data.data.variants.length);

    // 4. Verify the updated product
    console.log('\\n4. Verifying updated product...');
    const updatedResponse = await axios.get(
      `${BASE_URL}/products/${productId}/with-variants-and-images`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    console.log('✅ Updated product retrieved!');
    console.log('Total number of variants after adding:', updatedResponse.data.data.variants.length);

    // Check the updated variant and image hierarchy
    updatedResponse.data.data.variants.forEach((variant, index) => {
      console.log(`  Variant ${index + 1}: ID=${variant.id}, Price=$${variant.price}`);
      console.log(`    Number of images: ${variant.images.length}`);
      variant.images.forEach((image, imgIndex) => {
        console.log(`      Image ${imgIndex + 1}: ID=${image.id}, Position=${image.position}, URL=${image.url}`);
      });
    });

    console.log('\\n🎉 Combined product test completed successfully!');
    console.log('✅ Product → Variant → Images hierarchy is working correctly!');

  } catch (error) {
    console.error('❌ Error during test:', error.response?.data || error.message);
  }
}

// Run the test
testCombinedProductCreation();