#!/usr/bin/env node

// This script initializes the database schema

import { readFileSync } from 'fs';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { join } from 'path';

config();

async function initializeDatabase() {
  console.log('Connecting to database...');
  
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'beanmart',
  });

  try {
    // Read the database schema file
    const schemaPath = join(__dirname, '../../database.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
  } finally {
    await pool.end();
  }
}

void initializeDatabase();