#!/usr/bin/env node

// Script to activate an admin user
// Usage: node activate-admin.js <admin_email>

const { Pool } = require('pg');
require('dotenv').config();

async function activateAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Error: Email is required');
    console.log('Usage: node activate-admin.js <admin_email>');
    process.exit(1);
  }
  
  console.log('Activating admin user...');
  console.log('Email:', email);
  
  try {
    // Create database connection
    const pool = new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'beanmart',
    });
    
    console.log('Connected to database');
    
    // Activate admin user
    const query = `
      UPDATE admins
      SET is_active = true, updated_at = NOW()
      WHERE email = $1
      RETURNING id, email, full_name, is_active, updated_at
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      console.log('No admin user found with email:', email);
    } else {
      console.log('Admin user activated successfully!');
      console.log('Admin details:');
      console.log('- ID:', result.rows[0].id);
      console.log('- Email:', result.rows[0].email);
      console.log('- Full Name:', result.rows[0].full_name || 'N/A');
      console.log('- Active:', result.rows[0].is_active ? 'Yes' : 'No');
      console.log('- Updated At:', result.rows[0].updated_at);
    }
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error activating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
activateAdmin();