-- Schema do Ranking de Filmes. Idempotente: pode rodar várias vezes.

-- gen_random_uuid() é nativo do Postgres 13+ (o Neon roda 15+),
-- então não é preciso criar nenhuma extensão.

CREATE TABLE IF NOT EXISTS filmes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil            TEXT NOT NULL CHECK (perfil IN ('mik', 'vit')),
  nome              TEXT NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 200),
  data_assistida    DATE NOT NULL,
  comentario        TEXT CHECK (comentario IS NULL OR char_length(comentario) <= 2000),

  gostei            SMALLINT NOT NULL CHECK (gostei BETWEEN 1 AND 5),
  figurino          SMALLINT NOT NULL CHECK (figurino BETWEEN 1 AND 5),
  sonoridade        SMALLINT NOT NULL CHECK (sonoridade BETWEEN 1 AND 5),
  imersao           SMALLINT NOT NULL CHECK (imersao BETWEEN 1 AND 5),
  criatividade      SMALLINT NOT NULL CHECK (criatividade BETWEEN 1 AND 5),
  imprevisibilidade SMALLINT NOT NULL CHECK (imprevisibilidade BETWEEN 1 AND 5),
  enredo            SMALLINT NOT NULL CHECK (enredo BETWEEN 1 AND 5),
  atuacao           SMALLINT NOT NULL CHECK (atuacao BETWEEN 1 AND 5),
  genero            SMALLINT NOT NULL CHECK (genero BETWEEN 1 AND 5),
  cenario           SMALLINT NOT NULL CHECK (cenario BETWEEN 1 AND 5),
  memoria           SMALLINT NOT NULL CHECK (memoria BETWEEN 1 AND 5),

  nota_final        NUMERIC(3,2) NOT NULL,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS filmes_ranking_idx
  ON filmes (perfil, nota_final DESC, gostei DESC);
