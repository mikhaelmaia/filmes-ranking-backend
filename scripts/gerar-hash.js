import bcrypt from 'bcryptjs';

const senha = process.argv[2];

if (!senha) {
  console.error('Uso: npm run hash -- "sua-senha"');
  process.exit(1);
}

const hash = await bcrypt.hash(senha, 10);
console.log(hash);
