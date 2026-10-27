# Ranking de Filmes — API

API do sistema pessoal de avaliação de filmes de dois perfis: **Mik** (`mik`) e **Vit** (`vit`).
Cada perfil cadastra seus filmes, dá nota de 1 a 5 em 11 critérios e o servidor calcula
a nota final ponderada. Qualquer perfil logado pode **ler** a lista do outro, mas só o
dono pode editar ou excluir os próprios filmes.

Stack: Node 22, ES Modules, Vercel Serverless Functions (pasta `api/`, sem framework),
Neon Postgres (`@neondatabase/serverless`), `bcryptjs` e `jsonwebtoken`.

## Critérios e cálculo da nota

| Critério | Chave | Peso |
| --- | --- | --- |
| O quanto gostei do filme | `gostei` | 0,50 |
| Figurino | `figurino` | 0,05 |
| Sonoridade | `sonoridade` | 0,05 |
| Imersão | `imersao` | 0,05 |
| Criatividade | `criatividade` | 0,05 |
| Imprevisibilidade | `imprevisibilidade` | 0,05 |
| Enredo | `enredo` | 0,05 |
| Atuação | `atuacao` | 0,05 |
| Gênero | `genero` | 0,05 |
| Cenário | `cenario` | 0,05 |
| Memória | `memoria` | 0,05 |

```
nota = gostei × 0,50 + (soma dos outros 10) × 0,05
```

Arredondada em 2 casas. A nota é **sempre** calculada no servidor — qualquer `score`
enviado pelo cliente é ignorado.

## Variáveis de ambiente

Todas são lidas de `process.env`. Em produção, configure na Vercel; para rodar local,
crie um `.env.local` (não versionado).

| Variável | Para que serve |
| --- | --- |
| `DATABASE_URL` | String de conexão do Neon Postgres |
| `MIK_PASSWORD_HASH` | Hash bcrypt da senha do perfil `mik` |
| `VIT_PASSWORD_HASH` | Hash bcrypt da senha do perfil `vit` |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT |
| `FRONTEND_URL` | Origem liberada no CORS (ex.: `http://localhost:5173`) |

## Como rodar local

```bash
npm install
npm run migrate      # cria tabela e índice no banco (idempotente)
npm run local        # http://localhost:3000
```

`npm run local` usa `vercel dev` (precisa do Vercel CLI: `npm i -g vercel`). `npm run migrate` carrega as variáveis de `.env.local`
via `node --env-file`.

Checagem rápida: `curl http://localhost:3000/api/health`

### Recriar o banco do zero

```bash
npm run migrate:reset
```

Faz `DROP TABLE IF EXISTS filmes` e aplica `db/schema.sql` de novo. **Apaga todos os
filmes cadastrados.** O script mostra o host do banco e exige que você digite `sim`
para confirmar; qualquer outra resposta cancela sem alterar nada.

## Como gerar o hash de uma senha

```bash
npm run hash -- "minha-senha"
```

Copie a saída para `MIK_PASSWORD_HASH` ou `VIT_PASSWORD_HASH`.

## Rotas

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Sinal de vida |
| `POST` | `/api/login` | — | Autentica e devolve o token |
| `GET` | `/api/filmes?perfil=mik\|vit` | Bearer | Lista filmes de um perfil (sem o parâmetro, usa o do token) |
| `POST` | `/api/filmes` | Bearer | Cria filme para o perfil do token |
| `GET` | `/api/filmes/:id` | Bearer | Detalhe de um filme (qualquer perfil) |
| `PUT` | `/api/filmes/:id` | Bearer | Edita (só o dono) |
| `DELETE` | `/api/filmes/:id` | Bearer | Exclui (só o dono) |

Todas aplicam CORS e respondem `OPTIONS` com `204`.

Ordenação da lista: `nota_final DESC`, `gostei DESC`, `nome ASC`.

### Códigos de resposta

| Código | Quando |
| --- | --- |
| `400` | Validação falhou — `{ erro, campos }`; ou `?perfil` inválido |
| `401` | `{ erro: "Senha incorreta" }` no login; `{ erro: "Não autorizado" }` sem token válido |
| `403` | `{ erro: "Sem permissão" }` ao editar/excluir filme de outro perfil |
| `404` | Filme inexistente ou `:id` que não é UUID |
| `405` | Método não permitido |
| `500` | `{ erro: "Erro interno" }` — detalhes só no `console.error` |

### Formato do filme

```json
{
  "id": "uuid",
  "owner": "mik",
  "name": "Interestelar",
  "date": "2026-10-01",
  "comment": "texto ou string vazia",
  "notes": {
    "gostei": 5, "figurino": 4, "sonoridade": 5, "imersao": 5,
    "criatividade": 5, "imprevisibilidade": 4, "enredo": 5,
    "atuacao": 5, "genero": 4, "cenario": 5, "memoria": 5
  },
  "score": 4.85,
  "createdAt": "2026-10-27T18:00:00.000Z",
  "updatedAt": "2026-10-27T18:00:00.000Z"
}
```

Corpo aceito em `POST` e `PUT`: `{ name, date, comment, notes }`.

Regras de validação:

- `name`: obrigatório, com `trim`, de 1 a 200 caracteres.
- `date`: obrigatória, `YYYY-MM-DD`, data real, não pode ser no futuro.
- `comment`: opcional, até 2000 caracteres.
- `notes`: as 11 chaves, cada uma inteiro de 1 a 5.

## Exemplos de curl

Login:

```bash
curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"perfil":"mik","senha":"SUA_SENHA"}'
```

Guarde o token:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"perfil":"mik","senha":"SUA_SENHA"}' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
```

Listar:

```bash
curl -s "http://localhost:3000/api/filmes?perfil=mik" -H "Authorization: Bearer $TOKEN"
```

Criar:

```bash
curl -s -X POST http://localhost:3000/api/filmes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Interestelar",
    "date": "2026-10-01",
    "comment": "Muito bom",
    "notes": {
      "gostei": 5, "figurino": 4, "sonoridade": 5, "imersao": 5,
      "criatividade": 5, "imprevisibilidade": 4, "enredo": 5,
      "atuacao": 5, "genero": 4, "cenario": 5, "memoria": 5
    }
  }'
```

## Deploy na Vercel

1. No painel da Vercel, importe este repositório.
2. **Framework Preset: `Other`.** Não há build: as funções em `api/` são detectadas
   automaticamente. Deixe Build Command e Output Directory vazios.
3. Em **Settings → Environment Variables**, cadastre as cinco variáveis (marque
   Production, Preview e Development):

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | string de conexão do Neon |
| `MIK_PASSWORD_HASH` | hash bcrypt gerado por `npm run hash` |
| `VIT_PASSWORD_HASH` | hash bcrypt gerado por `npm run hash` |
| `JWT_SECRET` | segredo longo e aleatório |
| `FRONTEND_URL` | URL do front em produção, ex.: `https://ranking-filmes.vercel.app` |

4. Rode a migração uma vez apontando o `.env.local` para o mesmo banco
   (`npm run migrate`). A Vercel não roda migração no deploy.
5. Faça o deploy e teste:

```bash
curl -s https://SEU-PROJETO.vercel.app/api/health
# {"ok":true,"hora":"2026-10-27T18:00:00.000Z"}
```

Se o `/api/health` responder mas o login der `500`, quase sempre falta alguma variável
de ambiente — confira os logs em **Deployments → Functions**.

> Variável de ambiente nova ou alterada só vale no **próximo deploy**. Depois de mexer
> nelas, faça um redeploy (**Deployments → ⋯ → Redeploy**).

## Como trocar as senhas

1. Gere o hash da nova senha:

```bash
npm run hash -- 'nova-senha'
```

2. Cole o hash em `MIK_PASSWORD_HASH` (ou `VIT_PASSWORD_HASH`) **na Vercel** e também
   no seu `.env.local`, para o ambiente local continuar batendo.
3. Faça o redeploy na Vercel.

Use aspas simples na senha para o shell não interpretar caracteres como `$` e `!`.
Nunca comite o hash nem a senha: eles só vivem na Vercel e no `.env.local` (que está
no `.gitignore`).

Trocar a senha **não** invalida os tokens já emitidos — quem está logado segue logado
até o token expirar (30 dias). Para derrubar todas as sessões na hora, troque o
`JWT_SECRET`: isso invalida todos os tokens existentes e **desloga os dois perfis**,
que precisarão entrar de novo.

## Como trocar a FRONTEND_URL

`FRONTEND_URL` é a única origem aceita no CORS. Quando o domínio do front mudar
(domínio próprio, novo projeto na Vercel, outra porta local), atualize-a — senão o
navegador bloqueia as chamadas com erro de CORS, mesmo com a API respondendo certo.

1. Altere `FRONTEND_URL` em **Settings → Environment Variables** na Vercel.
2. Redeploy.
3. Em desenvolvimento, ajuste a mesma variável no `.env.local` (normalmente
   `http://localhost:5173`).

Use a origem exata: protocolo + domínio, **sem barra no final** e sem caminho —
`https://ranking-filmes.vercel.app`, não `https://ranking-filmes.vercel.app/`.

Cada preview deployment do front tem uma URL própria, que não estará liberada. Para
testar um preview, aponte `FRONTEND_URL` para ele temporariamente (de preferência no
ambiente Preview) ou rode o front local contra a API de produção.

## Estrutura

```
api/
  health.js          GET  /api/health
  login.js           POST /api/login
  filmes/index.js    GET e POST /api/filmes
  filmes/[id].js     GET, PUT e DELETE /api/filmes/:id
lib/
  db.js              conexão Neon
  cors.js            headers de CORS + preflight
  auth.js            geração e validação de token
  criterios.js       os 11 critérios e seus pesos
  nota.js            cálculo da nota final
  validacao.js       validação do corpo e do UUID
  filme.js           linha do banco → JSON da API
  consultas.js       queries parametrizadas
  corpo.js           leitura do JSON da requisição
  schema.js          lê db/schema.sql e aplica comando por comando
db/
  schema.sql         tabela e índice (idempotente)
scripts/
  gerar-hash.js      gera hash bcrypt de uma senha
  migrate.js         aplica db/schema.sql no banco
  reset.js           dropa a tabela e reaplica o schema (pede confirmação)
```
