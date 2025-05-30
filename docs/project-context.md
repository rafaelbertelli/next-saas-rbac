# 🧠 Contexto do Projeto

> **Para LLMs e Desenvolvedores**: Este arquivo contém contexto específico, decisões de design e nuances importantes do projeto que complementam a documentação técnica.

## 🎯 Visão do Produto

### Propósito

- **SaaS Boilerplate** multi-tenant para startups
- **RBAC robusto** como diferencial principal
- **Fastify + Next.js** como stack moderna e performática
- **Auto-join por domínio** como feature única para empresas

### Target Audience

- Desenvolvedores criando SaaS B2B
- Empresas que precisam de multi-tenancy
- Projetos que precisam de RBAC granular

## 🏗️ Decisões de Arquitetura Importantes

### Por que Fastify (não Express/NestJS)?

- **Performance**: ~3x mais rápido que Express
- **TypeScript nativo**: Melhor DX sem setup complexo
- **Schema-driven**: Validação e documentação automática
- **Plugin ecosystem**: Modular e extensível

### Por que Prisma Schema dividido?

```
prisma/models/
├── user.prisma
├── organization.prisma
├── project.prisma
└── enums.prisma
```

- **Manutenibilidade**: Cada domínio isolado
- **Colaboração**: Evita conflitos em schema único
- **Clarity**: Relacionamentos mais óbvios

### Por que JWT (não Sessions)?

- **Stateless**: Facilita scaling horizontal
- **Multi-app**: Pode ser usado em mobile/desktop
- **Simplicity**: Menos complexidade de infra

## 🔑 Nuances de Negócio

### Auto-Join por Domínio

```typescript
// Esta é uma feature core, não opcional
const [_, domain] = email.split("@");
const autoJoinOrganization = await prisma.organization.findFirst({
  where: { domain, shouldAttachUsersByDomain: true },
});
```

**Por quê?** Empresas querem que funcionários entrem automaticamente na org da empresa.

### Owner vs Admin

- **Owner**: User que criou a org (único)
- **Admin**: Role que pode ser atribuída (múltiplos)
- **Transferência**: Só owner pode transferir ownership

### Slug Strategy

- **Organizations**: `company-name` (único globalmente)
- **Projects**: `project-name` (único por organização)
- **Auto-generated**: Via `createSlug()` com sanitização

## ⚠️ Limitações Conhecidas

### Não Implementado (mas projetado)

1. **Sistema de Convites**: Schema existe, rotas não
2. **Billing**: Schema básico, lógica não implementada
3. **Member Management**: CRUD de membros pendente
4. **Email Service**: Password recovery gera token mas não envia email

### Trade-offs Aceitos

1. **JWT Expiration**: 7 dias fixo (não refresh tokens)
2. **No Rate Limiting**: Simplicity over protection
3. **No Soft Deletes**: Hard deletes por simplicidade
4. **GitHub Only**: OAuth limitado a GitHub por MVP

## 🔧 Configurações Específicas

### Environment Critical

```bash
# Core - sem eles nada funciona
DATABASE_URL="postgresql://..."
JWT_SECRET="super-secret-key"

# OAuth - só GitHub funciona
GITHUB_OAUTH_CLIENT_ID="..."
GITHUB_OAUTH_CLIENT_SECRET="..."
GITHUB_OAUTH_REDIRECT_URI="http://localhost:3000/auth/github/callback"
GITHUB_OAUTH_GRANTED_ACCESS_URI="https://api.github.com/user"
```

### Peculiaridades do Setup

- **Prisma generate**: Vai para `src/generated/prisma` (custom path)
- **Port 3333**: API roda em 3333 (não 3000)
- **Monorepo**: pnpm workspaces, comandos devem ser run na raiz
- **TypeScript paths**: `@/` mapeado para `apps/api/src/`

## 🐛 Gotchas Importantes

### 1. Prisma Client Path

```typescript
// ❌ Errado
import { PrismaClient } from "@prisma/client";

// ✅ Correto
import { PrismaClient } from "@/generated/prisma";
```

### 2. Authentication Middleware

```typescript
// ⚠️ Aplicar ANTES das rotas que precisam de auth
app.register(authMiddleware).get("/protected-route", async (request, reply) => {
  // request.getCurrentUserId() disponível aqui
});
```

### 3. Error Handling

```typescript
// ✅ Use custom error classes
throw new NotFoundError("User not found");

// ❌ Não use Error genérico
throw new Error("User not found");
```

### 4. Response Pattern

```typescript
// ✅ Sempre retorne message + data
return reply.send({
  message: "Success message",
  data: { result },
});

// ❌ Não retorne dados direto
return reply.send(result);
```

## 🚀 Roadmap Técnico

### Next Steps (Priority Order)

1. **Invites System**: Implementar CRUD de convites
2. **Member Management**: CRUD de membros de organização
3. **Email Service**: Integrar com SendGrid/AWS SES
4. **Project Updates**: PUT endpoint para projetos
5. **Billing Logic**: Implementar cobrança por projeto/membro

### Future Considerations

- **Multi-OAuth**: Adicionar Google, Microsoft
- **Webhooks**: Sistema de eventos para integrações
- **Audit Log**: Trail de ações importantes
- **Rate Limiting**: Proteção contra abuse
- **Soft Deletes**: Para compliance/recovery

## 🔍 Debugging Tips

### Common Issues

1. **"getCurrentUserId not found"**: authMiddleware não aplicado
2. **"Prisma client not generated"**: Run `pnpm db:generate`
3. **"Invalid token"**: JWT_SECRET mudou ou token expirado
4. **"Slug conflict"**: Organização/projeto com mesmo slug

### Useful Commands

```bash
# Reset everything
pnpm db:reset

# Check logs
cd apps/api && pnpm dev

# Test specific endpoint
curl -H "Authorization: Bearer TOKEN" http://localhost:3333/users
```

## 📝 Code Review Checklist

### Backend Features

- [ ] Route usa `authMiddleware` se protegida
- [ ] Schema Zod definido em arquivo separado
- [ ] Service layer separa lógica de negócio
- [ ] Repository encapsula acesso ao Prisma
- [ ] Error handling com classes customizadas
- [ ] Response segue padrão `message + data`
- [ ] TypeScript types explícitos
- [ ] Imports usando `@/` paths

### Quality Gates

- [ ] `npx eslint [arquivo]` passa sem erros
- [ ] Testes unitários para service
- [ ] Integration test para rota
- [ ] Schema de response documentado

---

**💡 Tip**: Este arquivo deve ser atualizado sempre que decisões importantes de arquitetura forem tomadas ou quando gotchas específicos forem descobertos.
