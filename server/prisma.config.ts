import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// NODE_ENV=test makes Prisma commands use .env.test (the separate test database).
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env', quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});