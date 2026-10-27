import { CRITERIOS, PESOS } from './criterios.js';

/** Nota final ponderada, arredondada em 2 casas decimais. */
export function calcularNota(notas) {
  const total = CRITERIOS.reduce(
    (soma, chave) => soma + Number(notas[chave]) * PESOS[chave],
    0
  );

  return Math.round(total * 100) / 100;
}
