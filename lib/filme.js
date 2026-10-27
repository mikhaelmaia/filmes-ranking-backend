import { CRITERIOS } from './criterios.js';

/** Converte uma linha da tabela filmes no JSON público da API. */
export function paraFilme(linha) {
  const notes = {};
  for (const chave of CRITERIOS) notes[chave] = Number(linha[chave]);

  return {
    id: linha.id,
    owner: linha.perfil,
    name: linha.nome,
    date: linha.data_assistida,
    comment: linha.comentario ?? '',
    notes,
    score: Number(linha.nota_final),
    createdAt: paraIso(linha.criado_em),
    updatedAt: paraIso(linha.atualizado_em),
  };
}

function paraIso(valor) {
  if (valor instanceof Date) return valor.toISOString();
  return valor == null ? null : new Date(valor).toISOString();
}
