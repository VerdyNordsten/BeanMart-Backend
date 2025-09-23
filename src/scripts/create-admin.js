#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'beanmart',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password.length >= 8;
};

// Check if admin exists
const checkAdminExists = async (email) => {
  try {
    const query = 'SELECT id, email FROM admins WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
    throw error;
  }
};

// Create admin
const createAdmin = async (adminData) => {
  try {
    const { email, full_name, password, is_active = true } = adminData;
    
    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `INSERT INTO admins (email, full_name, password_hash, is_active) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [email, full_name, password_hash, is_active];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    throw error;
  }
};

// Update admin password
const updateAdminPassword = async (adminId, password) => {
  try {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = 'UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [password_hash, adminId]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating admin password:', error.message);
    throw error;
  }
};

// List all admins
const listAdmins = async () => {
  try {
    const query = 'SELECT id, email, full_name, is_active, created_at FROM admins ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    throw error;
  }
};

// Show help
const showHelp = () => {
  console.log('🔐 Beanmart Admin Management Script');
  console.log('===================================\n');
  console.log('Usage:');
  console.log('  node create-admin.js --list                    List all admins');
  console.log('  node create-admin.js --create <email> <pass>   Create admin');
  console.log('  node create-admin.js --update <email> <pass>   Update admin password');
  console.log('  node create-admin.js --help                    Show this help\n');
  console.log('Examples:');
  console.log('  node create-admin.js --create admin@beanmart.com admin123');
  console.log('  node create-admin.js --update admin@beanmart.com newpassword');
  console.log('  node create-admin.js --list\n');
};

// Main function
const main = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully\n');

    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
      showHelp();
      return;
    }
    
    if (args.includes('--list') || args.includes('-l')) {
      // List admins
      console.log('📋 Existing Admins');
      console.log('==================\n');

      const admins = await listAdmins();
      
      if (admins.length === 0) {
        console.log('No admins found.');
        return;
      }

      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Name: ${admin.full_name || 'Not provided'}`);
        console.log(`   Active: ${admin.is_active ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${admin.created_at.toISOString()}`);
        console.log('');
      });

    } else if (args.includes('--create')) {
      // Create admin
      const emailIndex = args.indexOf('--create') + 1;
      const passwordIndex = emailIndex + 1;
      
      if (emailIndex >= args.length || passwordIndex >= args.length) {
        console.error('❌ Usage: --create <email> <password>');
        process.exit(1);
      }
      
      const email = args[emailIndex];
      const password = args[passwordIndex];
      
      if (!isValidEmail(email)) {
        console.error('❌ Invalid email format.');
        process.exit(1);
      }
      
      if (!isValidPassword(password)) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
      }

      // Check if admin already exists
      const existingAdmin = await checkAdminExists(email);
      if (existingAdmin) {
        console.log(`⚠️  Admin with email ${email} already exists.`);
        console.log('Use --update to change password.');
        process.exit(1);
      }

      console.log('🔄 Creating admin account...');

      const newAdmin = await createAdmin({
        email,
        full_name: 'Admin User',
        password,
        is_active: true
      });

      console.log('\n✅ Admin created successfully!');
      console.log('================================');
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`👤 Name: ${newAdmin.full_name || 'Not provided'}`);
      console.log(`🆔 ID: ${newAdmin.id}`);
      console.log(`✅ Active: ${newAdmin.is_active ? 'Yes' : 'No'}`);
      console.log(`📅 Created: ${newAdmin.created_at.toISOString()}`);
      console.log('================================\n');
      
      console.log('🔗 You can now use this admin account to:');
      console.log('   • Access admin endpoints');
      console.log('   • Manage products and variants');
      console.log('   • Upload images');
      console.log('   • View orders and users');

    } else if (args.includes('--update')) {
      // Update admin password
      const emailIndex = args.indexOf('--update') + 1;
      const passwordIndex = emailIndex + 1;
      
      if (emailIndex >= args.length || passwordIndex >= args.length) {
        console.error('❌ Usage: --update <email> <password>');
        process.exit(1);
      }
      
      const email = args[emailIndex];
      const password = args[passwordIndex];
      
      if (!isValidEmail(email)) {
        console.error('❌ Invalid email format.');
        process.exit(1);
      }
      
      if (!isValidPassword(password)) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
      }

      // Check if admin exists
      const existingAdmin = await checkAdminExists(email);
      if (!existingAdmin) {
        console.log(`❌ Admin with email ${email} not found.`);
        process.exit(1);
      }

      console.log('🔄 Updating admin password...');

      const updatedAdmin = await updateAdminPassword(existingAdmin.id, password);
      if (updatedAdmin) {
        console.log('\n✅ Admin password updated successfully!');
        console.log(`📧 Email: ${updatedAdmin.email}`);
        console.log(`🆔 ID: ${updatedAdmin.id}`);
        console.log(`✅ Active: ${updatedAdmin.is_active ? 'Yes' : 'No'}`);
      } else {
        console.error('❌ Failed to update admin password.');
        process.exit(1);
      }

    } else {
      console.error('❌ Unknown command. Use --help for usage information.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});