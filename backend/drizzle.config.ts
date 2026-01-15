import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  out: './drizzle',
  schema: 'src/db/schema.ts',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
});
