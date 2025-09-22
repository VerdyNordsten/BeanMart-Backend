import type { QueryResult } from 'pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER ?? 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME ?? 'beanmart',
  password: process.env.DB_PASSWORD ?? 'postgres',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
});

// Test the database connection
pool.query('SELECT NOW()', (err: Error, _res: QueryResult) => {
  if (err) {
    console.warn('Warning: Database connection failed -', err.message);
    console.warn('The application will continue running but database features will not work.');
  } else {
    console.log('Database connected successfully');
  }
});

export default pool;