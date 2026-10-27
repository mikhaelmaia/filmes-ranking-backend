import { aplicarCors } from '../../lib/cors.js';
import { lerCorpo } from '../../lib/corpo.js';
import { autenticar, perfilValido } from '../../lib/auth.js';
import { listarFilmes, inserirFilme } from '../../lib/consultas.js';
import { validarFilme } from '../../lib/validacao.js';
import { calcularNota } from '../../lib/nota.js';
import { paraFilme } from '../../lib/filme.js';

export default async function handler(req, res) {
  if (aplicarCors(req, res)) return;

  const perfil = autenticar(req, res);
  if (!perfil) return;

  try {
    if (req.method === 'GET') return await listar(req, res, perfil);
    if (req.method === 'POST') return await criar(req, res, perfil);

    res.status(405).json({ erro: 'Método não permitido' });
  } catch (erro) {
    console.error(`Erro em ${req.method} /api/filmes:`, erro);
    res.status(500).json({ erro: 'Erro interno' });
  }
}

// Qualquer perfil logado pode ler a lista de qualquer perfil.
async function listar(req, res, perfil) {
  const solicitado = req.query?.perfil;
  const alvo = solicitado === undefined || solicitado === '' ? perfil.id : solicitado;

  if (!perfilValido(alvo)) {
    res.status(400).json({ erro: 'Perfil inválido', campos: { perfil: 'Use "mik" ou "vit"' } });
    return;
  }

  const linhas = await listarFilmes(alvo);
  res.status(200).json({ filmes: linhas.map(paraFilme) });
}

// O filme é sempre criado para o perfil do token, nunca para o do corpo.
async function criar(req, res, perfil) {
  const { campos, dados } = validarFilme(lerCorpo(req));

  if (campos) {
    res.status(400).json({ erro: 'Dados inválidos', campos });
    return;
  }

  const nota = calcularNota(dados.notas);
  const [linha] = await inserirFilme(perfil.id, dados, nota);

  res.status(201).json({ filme: paraFilme(linha) });
}
