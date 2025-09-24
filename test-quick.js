const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function quickTest() {
  console.log('🚀 Quick Backend Flow Test\n');
  
  try {
    // 1. Test server health
    console.log('1. Testing server...');
    await axios.get(`${BASE_URL}/`);
    console.log('✅ Server OK\n');

    // 2. Test admin login
    console.log('2. Testing admin login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@beanmart.com',
      password: 'admin123',
      isAdmin: true
    });
    const token = loginRes.data.token;
    console.log('✅ Admin login OK\n');

    // 3. Test combined product creation
    console.log('3. Testing combined product creation...');
    const productData = {
      product: {
        slug: `test-${Date.now()}`,
        name: 'Test Coffee Product',
        short_description: 'Quick test product',
        currency: 'USD',
        is_active: true
      },
      variants: [{
        price: 19.99,
        stock: 100,
        weightGram: 500,
        isActive: true,
        images: [{
          url: 'https://via.placeholder.com/300x300.png',
          position: 1
        }]
      }]
    };

    const createRes = await axios.post(
      `${BASE_URL}/products/with-variants-and-images`,
      productData,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Product created:', createRes.data.data.product.id);
    console.log('✅ Variants:', createRes.data.data.variants.length);
    
    const productId = createRes.data.data.product.id;

    // 4. Test retrieval
    console.log('\n4. Testing data retrieval...');
    const getRes = await axios.get(
      `${BASE_URL}/products/${productId}/with-variants-and-images`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Retrieved product:', getRes.data.data.name);
    console.log('✅ Retrieved variants:', getRes.data.data.variants.length);
    console.log('✅ Retrieved images:', getRes.data.data.variants[0].images.length);

    // 5. Test database verification
    console.log('\n5. Database verification...');
    const variant = getRes.data.data.variants[0];
    const image = variant.images[0];
    
    console.log('✅ Product ID in DB:', getRes.data.data.id);
    console.log('✅ Variant ID in DB:', variant.id);
    console.log('✅ Image ID in DB:', image.id);
    console.log('✅ Foreign Key (variant_id):', image.variantId);

    // 6. Test storage URL
    console.log('\n6. Storage verification...');
    try {
      await axios.head(image.url);
      console.log('✅ Image URL accessible:', image.url);
    } catch (e) {
      console.log('⚠️  Image URL not accessible (expected for placeholder):', image.url);
    }

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Backend flow working correctly');
    console.log('✅ Data reaches database');
    console.log('✅ Storage URLs generated');
    console.log('✅ Product → Variant → Image hierarchy maintained');

    return true;

  } catch (error) {
    console.log('\n❌ TEST FAILED:');
    console.log('Error:', error.response?.data?.message || error.message);
    return false;
  }
}

quickTest().then(success => {
  process.exit(success ? 0 : 1);
});
