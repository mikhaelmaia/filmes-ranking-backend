import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { neon } from '@neondatabase/serverless';
import { aplicarSchema } from '../lib/schema.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Crie .env.local antes de resetar.');
  process.exit(1);
}

const banco = descreverBanco(process.env.DATABASE_URL);

console.log('');
console.log('*** ATENÇÃO: isso APAGA a tabela "filmes" e TODOS os filmes dela. ***');
console.log(`Banco: ${banco}`);
console.log('A operação é irreversível.');
console.log('');

const leitor = createInterface({ input: stdin, output: stdout });
const resposta = await leitor.question('Digite "sim" para confirmar: ');
leitor.close();

if (resposta.trim().toLowerCase() !== 'sim') {
  console.log('Cancelado. Nada foi alterado.');
  process.exit(0);
}

const sql = neon(process.env.DATABASE_URL);

try {
  console.log('> DROP TABLE IF EXISTS filmes');
  await sql.query('DROP TABLE IF EXISTS filmes');

  const total = await aplicarSchema(sql);
  console.log(`Banco recriado do zero (${total} comandos).`);
} catch (erro) {
  console.error('Falha no reset:', erro.message);
  process.exit(1);
}

/** Mostra host e nome do banco, sem expor usuário e senha. */
function descreverBanco(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname}${pathname}`;
  } catch {
    return '(DATABASE_URL não reconhecida)';
  }
}
