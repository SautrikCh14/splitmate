import fs from 'node:fs';
import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Tests use their own database. Values in .env.test replace the ones from .env.
const testEnv = fs.existsSync('.env.test') ? parse(fs.readFileSync('.env.test')) : {};

export default defineConfig({
  test: {
    env: testEnv,
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false, // test files share one database, so run them one at a time
  },
});