// test-api.ts
// Simple test script to verify API endpoints

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_V1_URL = `${BASE_URL}/api/v1`;

interface TestResult {
  status?: number;
  data?: any;
  error?: string;
}

async function testEndpoint(url: string, method: string = 'GET', body: any = null): Promise<TestResult> {
  try {
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`${method} ${url} - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { status: response.status, data };
  } catch (error: any) {
    console.error(`Error testing ${method} ${url}:`, error.message);
    console.log('---');
    return { error: error.message };
  }
}

async function runTests() {
  console.log('Testing Beanmart API Endpoints\n');
  
  // Test health check
  await testEndpoint(`${BASE_URL}/health`);
  
  // Test API v1 root
  await testEndpoint(`${API_V1_URL}`);
  
  // Test users endpoints
  console.log('Testing Users endpoints:');
  await testEndpoint(`${API_V1_URL}/users`);
  
  // Test creating a user
  const newUser = {
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+628123456789'
  };
  
  const userResult = await testEndpoint(`${API_V1_URL}/users`, 'POST', newUser);
  
  // Test products endpoints
  console.log('Testing Products endpoints:');
  await testEndpoint(`${API_V1_URL}/products`);
  await testEndpoint(`${API_V1_URL}/products/active`);
  
  // Test creating a product
  const newProduct = {
    slug: 'test-product',
    name: 'Test Product',
    short_description: 'A test product',
    base_price: 100000,
    currency: 'IDR',
    is_active: true
  };
  
  const productResult = await testEndpoint(`${API_V1_URL}/products`, 'POST', newProduct);
  
  // Test categories endpoints
  console.log('Testing Categories endpoints:');
  await testEndpoint(`${API_V1_URL}/categories`);
  
  // Test creating a category
  const newCategory = {
    slug: 'test-category',
    name: 'Test Category'
  };
  
  const categoryResult = await testEndpoint(`${API_V1_URL}/categories`, 'POST', newCategory);
}

// Run tests
runTests().catch(console.error);