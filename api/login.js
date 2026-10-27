import bcrypt from 'bcryptjs';
import { aplicarCors } from '../lib/cors.js';
import { lerCorpo } from '../lib/corpo.js';
import { PERFIS, gerarToken, perfilValido } from '../lib/auth.js';

const ERRO_CREDENCIAL = { erro: 'Senha incorreta' };

export default async function handler(req, res) {
  if (aplicarCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Método não permitido' });
    return;
  }

  try {
    const corpo = lerCorpo(req);
    const { perfil, senha } = corpo ?? {};

    if (!perfilValido(perfil) || typeof senha !== 'string' || !senha) {
      res.status(401).json(ERRO_CREDENCIAL);
      return;
    }

    const config = PERFIS[perfil];
    const hash = process.env[config.envSenha];

    if (!hash) {
      console.error(`Variável ${config.envSenha} não configurada`);
      res.status(401).json(ERRO_CREDENCIAL);
      return;
    }

    const confere = await bcrypt.compare(senha, hash);

    if (!confere) {
      res.status(401).json(ERRO_CREDENCIAL);
      return;
    }

    res.status(200).json({
      token: gerarToken(config.id),
      perfil: { id: config.id, name: config.name },
    });
  } catch (erro) {
    console.error('Erro em POST /api/login:', erro);
    res.status(500).json({ erro: 'Erro interno' });
  }
}
