import { sql } from './db.js';

/*
 * Todas as consultas vivem aqui para que a lista de colunas (e o to_char da
 * data) fique em um único lugar. São tagged templates: nunca há concatenação
 * de valores vindos do cliente.
 */

export function listarFilmes(perfil) {
  return sql`
    SELECT id, perfil, nome,
           to_char(data_assistida, 'YYYY-MM-DD') AS data_assistida,
           comentario,
           gostei, figurino, sonoridade, imersao, criatividade,
           imprevisibilidade, enredo, atuacao, genero, cenario, memoria,
           nota_final, criado_em, atualizado_em
      FROM filmes
     WHERE perfil = ${perfil}
     ORDER BY nota_final DESC, gostei DESC, nome ASC
  `;
}

export function buscarFilme(id) {
  return sql`
    SELECT id, perfil, nome,
           to_char(data_assistida, 'YYYY-MM-DD') AS data_assistida,
           comentario,
           gostei, figurino, sonoridade, imersao, criatividade,
           imprevisibilidade, enredo, atuacao, genero, cenario, memoria,
           nota_final, criado_em, atualizado_em
      FROM filmes
     WHERE id = ${id}
  `;
}

export function inserirFilme(perfil, { nome, data, comentario, notas }, nota) {
  return sql`
    INSERT INTO filmes (
      perfil, nome, data_assistida, comentario,
      gostei, figurino, sonoridade, imersao, criatividade,
      imprevisibilidade, enredo, atuacao, genero, cenario, memoria,
      nota_final
    ) VALUES (
      ${perfil}, ${nome}, ${data}, ${comentario},
      ${notas.gostei}, ${notas.figurino}, ${notas.sonoridade},
      ${notas.imersao}, ${notas.criatividade}, ${notas.imprevisibilidade},
      ${notas.enredo}, ${notas.atuacao}, ${notas.genero},
      ${notas.cenario}, ${notas.memoria},
      ${nota}
    )
    RETURNING id, perfil, nome,
              to_char(data_assistida, 'YYYY-MM-DD') AS data_assistida,
              comentario,
              gostei, figurino, sonoridade, imersao, criatividade,
              imprevisibilidade, enredo, atuacao, genero, cenario, memoria,
              nota_final, criado_em, atualizado_em
  `;
}

export function atualizarFilme(id, { nome, data, comentario, notas }, nota) {
  return sql`
    UPDATE filmes SET
      nome = ${nome},
      data_assistida = ${data},
      comentario = ${comentario},
      gostei = ${notas.gostei},
      figurino = ${notas.figurino},
      sonoridade = ${notas.sonoridade},
      imersao = ${notas.imersao},
      criatividade = ${notas.criatividade},
      imprevisibilidade = ${notas.imprevisibilidade},
      enredo = ${notas.enredo},
      atuacao = ${notas.atuacao},
      genero = ${notas.genero},
      cenario = ${notas.cenario},
      memoria = ${notas.memoria},
      nota_final = ${nota},
      atualizado_em = now()
    WHERE id = ${id}
    RETURNING id, perfil, nome,
              to_char(data_assistida, 'YYYY-MM-DD') AS data_assistida,
              comentario,
              gostei, figurino, sonoridade, imersao, criatividade,
              imprevisibilidade, enredo, atuacao, genero, cenario, memoria,
              nota_final, criado_em, atualizado_em
  `;
}

export function excluirFilme(id) {
  return sql`DELETE FROM filmes WHERE id = ${id}`;
}
