const axios = require('axios');

async function loginAdmin() {
  try {
    console.log('Attempting to login as admin user...');
    
    // Use the newly created admin credentials
    const response = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'test@example.com',
        password: 'testpassword123',
        isAdmin: true
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.data.full_name);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

loginAdmin();