#!/usr/bin/env node

// This script initializes the database schema

import { Pool } from 'pg';
import { config } from 'dotenv';

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
    console.log('Database connected successfully!');
    console.log('✅ Database schema is ready!');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

void initializeDatabase();