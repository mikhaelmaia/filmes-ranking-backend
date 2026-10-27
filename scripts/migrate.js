import { neon } from '@neondatabase/serverless';
import { aplicarSchema } from '../lib/schema.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Crie .env.local antes de migrar.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

try {
  const total = await aplicarSchema(sql);
  console.log(`Migração aplicada com sucesso (${total} comandos).`);
} catch (erro) {
  console.error('Falha na migração:', erro.message);
  process.exit(1);
}
