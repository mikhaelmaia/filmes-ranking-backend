export const CRITERIO_PRINCIPAL = 'gostei';

export const PESO_PRINCIPAL = 0.5;
export const PESO_SECUNDARIO = 0.05;

export const CRITERIOS_SECUNDARIOS = [
  'figurino',
  'sonoridade',
  'imersao',
  'criatividade',
  'imprevisibilidade',
  'enredo',
  'atuacao',
  'genero',
  'cenario',
  'memoria',
];

export const CRITERIOS = [CRITERIO_PRINCIPAL, ...CRITERIOS_SECUNDARIOS];

export const PESOS = Object.fromEntries(
  CRITERIOS.map((chave) => [
    chave,
    chave === CRITERIO_PRINCIPAL ? PESO_PRINCIPAL : PESO_SECUNDARIO,
  ])
);

export const ROTULOS = {
  gostei: 'O quanto gostei do filme',
  figurino: 'Figurino',
  sonoridade: 'Sonoridade',
  imersao: 'Imersão',
  criatividade: 'Criatividade',
  imprevisibilidade: 'Imprevisibilidade',
  enredo: 'Enredo',
  atuacao: 'Atuação',
  genero: 'Gênero',
  cenario: 'Cenário',
  memoria: 'Memória',
};
