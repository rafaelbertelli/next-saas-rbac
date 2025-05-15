# Deploy & Ambiente

## Rodando Localmente

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Configure o banco de dados (PostgreSQL recomendado)
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis
4. Rode as migrations:

   ```bash
   pnpm --filter @repo/api run prisma:migrate
   ```

5. Inicie a API:

   ```bash
   pnpm dev
   ```

## Variáveis de Ambiente

- Veja `.env.example` para todas as variáveis necessárias (DB, JWT, OAuth, etc)

## Migrations

- Use o Prisma para versionar e aplicar mudanças no banco:

  ```bash
  pnpm --filter @repo/api run prisma:migrate
  ```

## Deploy

- Recomenda-se usar Docker para produção
- Configure variáveis de ambiente no ambiente de produção
- Utilize serviços como Vercel (frontend) e Railway/Render/Heroku (backend)

## CI/CD

- Configure pipelines para rodar testes e lint antes do deploy
- Exemplo: Github Actions, Gitlab CI
