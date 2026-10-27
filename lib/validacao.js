import { CRITERIOS } from './criterios.js';

const MAX_NOME = 200;
const MAX_COMENTARIO = 2000;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function uuidValido(valor) {
  return typeof valor === 'string' && FORMATO_UUID.test(valor);
}

/**
 * Valida o corpo de criação/edição de filme.
 * Retorna { campos } quando há erros ou { dados } quando está tudo certo.
 */
export function validarFilme(corpo) {
  const campos = {};

  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return { campos: { body: 'Corpo da requisição inválido' } };
  }

  const nome = typeof corpo.name === 'string' ? corpo.name.trim() : '';
  if (!nome) {
    campos.name = 'Nome é obrigatório';
  } else if (nome.length > MAX_NOME) {
    campos.name = `Nome deve ter no máximo ${MAX_NOME} caracteres`;
  }

  const data = typeof corpo.date === 'string' ? corpo.date.trim() : '';
  if (!data) {
    campos.date = 'Data é obrigatória';
  } else if (!FORMATO_DATA.test(data)) {
    campos.date = 'Data deve estar no formato YYYY-MM-DD';
  } else if (!dataReal(data)) {
    campos.date = 'Data inexistente';
  } else if (data > hojeISO()) {
    campos.date = 'Data não pode ser no futuro';
  }

  let comentario = '';
  if (corpo.comment !== undefined && corpo.comment !== null) {
    if (typeof corpo.comment !== 'string') {
      campos.comment = 'Comentário deve ser texto';
    } else if (corpo.comment.length > MAX_COMENTARIO) {
      campos.comment = `Comentário deve ter no máximo ${MAX_COMENTARIO} caracteres`;
    } else {
      comentario = corpo.comment;
    }
  }

  const notas = {};
  const entrada = corpo.notes;

  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
    campos.notes = 'Notas são obrigatórias';
  } else {
    for (const chave of CRITERIOS) {
      const valor = entrada[chave];

      if (valor === undefined || valor === null || valor === '') {
        campos[`notes.${chave}`] = `Nota "${chave}" é obrigatória`;
        continue;
      }

      const numero = typeof valor === 'number' ? valor : Number(valor);

      if (!Number.isInteger(numero) || numero < 1 || numero > 5) {
        campos[`notes.${chave}`] = `Nota "${chave}" deve ser um inteiro de 1 a 5`;
        continue;
      }

      notas[chave] = numero;
    }
  }

  if (Object.keys(campos).length > 0) return { campos };

  return { dados: { nome, data, comentario, notas } };
}

function dataReal(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    d.getUTCFullYear() === ano &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia
  );
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}
