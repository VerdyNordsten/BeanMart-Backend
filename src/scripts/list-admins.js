#!/usr/bin/env node

// Script to list all admin users
// Usage: node list-admins.js

const { Pool } = require('pg');
require('dotenv').config();

async function listAdmins() {
  console.log('Listing all admin users...');
  
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
    
    // Get all admin users
    const query = `
      SELECT id, email, full_name, is_active, created_at, updated_at
      FROM admins
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('No admin users found');
    } else {
      console.log(`Found ${result.rows.length} admin user(s):`);
      console.log('----------------------------------------');
      result.rows.forEach((admin, index) => {
        console.log(`${index + 1}. ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Full Name: ${admin.full_name || 'N/A'}`);
        console.log(`   Active: ${admin.is_active ? 'Yes' : 'No'}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log(`   Updated: ${admin.updated_at}`);
        console.log('----------------------------------------');
      });
    }
    
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error listing admin users:', error.message);
    process.exit(1);
  }
}

// Run the function
listAdmins();