import { aplicarCors } from '../../lib/cors.js';
import { lerCorpo } from '../../lib/corpo.js';
import { autenticar } from '../../lib/auth.js';
import { buscarFilme, atualizarFilme, excluirFilme } from '../../lib/consultas.js';
import { validarFilme, uuidValido } from '../../lib/validacao.js';
import { calcularNota } from '../../lib/nota.js';
import { paraFilme } from '../../lib/filme.js';

const NAO_ENCONTRADO = { erro: 'Filme não encontrado' };

export default async function handler(req, res) {
  if (aplicarCors(req, res)) return;

  const perfil = autenticar(req, res);
  if (!perfil) return;

  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    res.status(405).json({ erro: 'Método não permitido' });
    return;
  }

  const id = req.query?.id;

  if (!uuidValido(id)) {
    res.status(404).json(NAO_ENCONTRADO);
    return;
  }

  try {
    const [linha] = await buscarFilme(id);

    if (!linha) {
      res.status(404).json(NAO_ENCONTRADO);
      return;
    }

    // Leitura é liberada; escrita só para o dono.
    if (req.method === 'GET') {
      res.status(200).json({ filme: paraFilme(linha) });
      return;
    }

    if (linha.perfil !== perfil.id) {
      res.status(403).json({ erro: 'Sem permissão' });
      return;
    }

    if (req.method === 'PUT') {
      const { campos, dados } = validarFilme(lerCorpo(req));

      if (campos) {
        res.status(400).json({ erro: 'Dados inválidos', campos });
        return;
      }

      const nota = calcularNota(dados.notas);
      const [atualizado] = await atualizarFilme(id, dados, nota);

      res.status(200).json({ filme: paraFilme(atualizado) });
      return;
    }

    await excluirFilme(id);
    res.status(204).end();
  } catch (erro) {
    console.error(`Erro em ${req.method} /api/filmes/${id}:`, erro);
    res.status(500).json({ erro: 'Erro interno' });
  }
}
