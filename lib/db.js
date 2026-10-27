import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida');
}

export const sql = neon(process.env.DATABASE_URL);
