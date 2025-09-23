import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Load environment variables
config();

async function testAuthAPIs() {
  console.log('Testing User Registration and Authentication...');
  
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'beanmart',
    password: process.env.DB_PASSWORD ?? 'postgres',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
  });
  
  try {
    // Test the database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // 1. Test user registration
    console.log('\n1. Testing user registration...');
    
    const newUser = {
      email: 'newuser@test.com',
      password: 'newpassword123',
      fullName: 'New Test User',
      phone: '+6281234567899'
    };
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [newUser.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('User already exists, deleting first...');
      await pool.query('DELETE FROM users WHERE email = $1', [newUser.email]);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, phone, full_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [newUser.email, newUser.phone, newUser.fullName, hashedPassword]
    );
    
    const user = userResult.rows[0];
    console.log('User registered successfully:', {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone
    });
    
    // 2. Test user login
    console.log('\n2. Testing user login...');
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(newUser.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Password verification failed');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('User login successful');
    console.log('Token generated:', token.substring(0, 20) + '...');
    
    // 3. Test token verification
    console.log('\n3. Testing token verification...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as { id: string, email: string, type: string };
    
    if (decoded.id !== user.id || decoded.email !== user.email || decoded.type !== 'user') {
      throw new Error('Token verification failed');
    }
    
    console.log('Token verified successfully:', {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type
    });
    
    // 4. Test getting user profile
    console.log('\n4. Testing get user profile...');
    
    const profileResult = await pool.query(
      'SELECT id, email, phone, full_name, created_at FROM users WHERE id = $1',
      [user.id]
    );
    
    if (profileResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const profile = profileResult.rows[0];
    console.log('User profile retrieved:', {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      createdAt: profile.created_at
    });
    
    // 5. Test admin login
    console.log('\n5. Testing admin login...');
    
    const adminEmail = 'admin1@test.com';
    const adminPassword = 'admin1';
    
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [adminEmail]
    );
    
    if (adminResult.rows.length === 0) {
      throw new Error('Admin not found');
    }
    
    const admin = adminResult.rows[0];
    
    // Verify admin password
    const isAdminPasswordValid = await bcrypt.compare(adminPassword, admin.password_hash);
    if (!isAdminPasswordValid) {
      throw new Error('Admin password verification failed');
    }
    
    // Generate admin JWT token
    const adminToken = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin login successful');
    console.log('Admin token generated:', adminToken.substring(0, 20) + '...');
    
    // 6. Test admin token verification
    console.log('\n6. Testing admin token verification...');
    
    const adminDecoded = jwt.verify(adminToken, process.env.JWT_SECRET ?? 'your-secret-key') as { id: string, email: string, type: string };
    
    if (adminDecoded.id !== admin.id || adminDecoded.email !== admin.email || adminDecoded.type !== 'admin') {
      throw new Error('Admin token verification failed');
    }
    
    console.log('Admin token verified successfully:', {
      id: adminDecoded.id,
      email: adminDecoded.email,
      type: adminDecoded.type
    });
    
    // 7. Test getting admin profile
    console.log('\n7. Testing get admin profile...');
    
    const adminProfileResult = await pool.query(
      'SELECT id, email, full_name, is_active, created_at, updated_at FROM admins WHERE id = $1',
      [admin.id]
    );
    
    if (adminProfileResult.rows.length === 0) {
      throw new Error('Admin not found');
    }
    
    const adminProfile = adminProfileResult.rows[0];
    console.log('Admin profile retrieved:', {
      id: adminProfile.id,
      email: adminProfile.email,
      fullName: adminProfile.full_name,
      isActive: adminProfile.is_active,
      createdAt: adminProfile.created_at,
      updatedAt: adminProfile.updated_at
    });
    
    console.log('\nAll authentication tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing authentication:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testAuthAPIs()
  .then(() => {
    console.log('\nAuthentication testing completed successfully.');
  })
  .catch(error => {
    console.error('Authentication testing failed:', error);
    process.exit(1);
  });

export default testAuthAPIs;