import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CAMINHO = fileURLToPath(new URL('../db/schema.sql', import.meta.url));

/**
 * Lê db/schema.sql e devolve os comandos individualmente: o driver HTTP do
 * Neon aceita um comando por requisição.
 */
export async function lerStatements() {
  const schema = await readFile(CAMINHO, 'utf8');

  return schema
    .split(';')
    .map((bloco) =>
      bloco
        .split('\n')
        .filter((linha) => !linha.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(Boolean);
}

/** Executa cada comando em sequência, registrando o progresso. */
export async function aplicarSchema(sql) {
  const statements = await lerStatements();

  for (const statement of statements) {
    console.log(`> ${statement.split('\n')[0]}`);
    await sql.query(statement);
  }

  return statements.length;
}
