# Testes & Qualidade

## Frameworks Utilizados

- **Unitários**: Jest
- **Componentes/Hooks**: React Testing Library

## Como rodar os testes

```bash
pnpm test
```

## Organização dos Arquivos

- Testes ficam ao lado do arquivo de origem
- Sufixo `.spec.ts` ou `.spec.tsx`

Exemplo:

```
┣ utils/
┃ ┣ group-children.ts
┃ ┣ group-children.spec.ts
```

## Padrões de Mock

```typescript
jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: { organization: { findMany: jest.fn() } },
}));
```

## Boas Práticas

- Use `describe` para agrupar cenários
- Use AAA (Arrange-Act-Assert)
- Teste caminhos de sucesso e erro
- Prefira mocks explícitos
- Teste comportamento, não implementação

## Cobertura

- Busque cobrir todos os fluxos relevantes de cada função/rota
