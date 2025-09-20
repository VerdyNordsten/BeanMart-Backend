import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: './src/models',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/coffee_store',
  },
  verbose: true,
  strict: true,
} satisfies Config;