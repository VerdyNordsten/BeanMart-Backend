#!/usr/bin/env node

// Script to create an admin user
// Usage: node create-admin.js [email] [password] [full_name]

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdmin() {
  // Get command line arguments or use defaults
  const email = process.argv[2] ?? 'admin@beanmart.com';
  const password = process.argv[3] ?? 'admin123';
  const fullName = process.argv[4] ?? 'Administrator';
  
  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('Full Name:', fullName);
  console.log('Password:', password ? '****' : 'admin123');
  
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');
    
    // Create database connection
    const pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'beanmart',
    });
    
    console.log('Connected to database');
    
    // Insert admin user
    const query = `
      INSERT INTO admins (email, full_name, password_hash, is_active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
      full_name = $2, password_hash = $3, is_active = $4, updated_at = NOW()
      RETURNING id, email, full_name, is_active, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      email,
      fullName,
      hashedPassword,
      true
    ]);
    
    console.log('Admin user created/updated successfully!');
    console.log('Admin details:');
    console.log('- ID:', result.rows[0].id);
    console.log('- Email:', result.rows[0].email);
    console.log('- Full Name:', result.rows[0].full_name);
    console.log('- Active:', result.rows[0].is_active);
    console.log('- Created At:', result.rows[0].created_at);
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdmin();