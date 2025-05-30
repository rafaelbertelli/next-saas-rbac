# Guia de Desenvolvimento

## 🏗️ Arquitetura do Projeto

### Monorepo Structure

```
next-saas-rbac/
├── apps/
│   ├── api/          # Backend Fastify + Prisma
│   └── web/          # Frontend Next.js
├── packages/
│   ├── auth/         # RBAC logic shared
│   ├── env/          # Environment variables
│   └── eslint-config/
└── docs/             # Documentação
```

### Backend (apps/api)

- **Framework**: Fastify com TypeScript
- **ORM**: Prisma (modelos organizados em arquivos separados)
- **Autenticação**: JWT via @fastify/jwt
- **Validação**: Zod + fastify-type-provider-zod
- **Logging**: Pino (built-in do Fastify)
- **Testes**: Jest + ts-jest

### Frontend (apps/web)

- **Framework**: Next.js 14 com App Router
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Context + useState/useReducer
- **HTTP**: fetch nativo com abstração customizada

## 🏛️ Padrões Arquiteturais

### Arquitetura Principal: Layered Architecture

O projeto segue uma **arquitetura em camadas bem definida** com separação clara de responsabilidades:

```
📊 Presentation Layer (Routes)
    ↓
🧠 Business Logic Layer (Services)
    ↓
💾 Data Access Layer (Repositories)
    ↓
🗄️ Database (Prisma + PostgreSQL)
```

### 1. **Routes Layer (Apresentação)**

**Estrutura:**

```
apps/api/src/routes/
├── organizations/
│   ├── create-organization/
│   │   ├── create-organization.route.ts    # Handler
│   │   ├── schema.ts                       # Validação Zod
│   │   └── index.ts                        # Export
```

**Responsabilidades:**

- ✅ Validação de entrada (Zod schemas)
- ✅ Autenticação/autorização (middleware)
- ✅ Orquestração de services
- ✅ Serialização de resposta

**Exemplo:**

```typescript
export async function createOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/organizations",
      { schema: createOrganizationSchema },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { name, domain } = request.body;

        const organization = await createOrganizationService({
          userId,
          name,
          domain,
        });

        return reply.status(201).send({
          message: "Organization created successfully",
          data: { organizationId: organization.id },
        });
      }
    );
}
```

### 2. **Services Layer (Lógica de Negócio)**

**Padrão:** Funções puras com tipos explícitos

**Responsabilidades:**

- ✅ Regras de negócio
- ✅ Validações complexas
- ✅ Orquestração de repositórios
- ✅ Transformações de dados

**Exemplo:**

```typescript
type CreateOrganization = {
  userId: string;
  name: string;
  domain?: string | null;
};

export async function createOrganizationService({
  userId,
  name,
  domain,
}: CreateOrganization) {
  const slug = createSlug(name);

  return await createOrganizationRepository({
    userId,
    name,
    domain,
    slug,
  });
}
```

### 3. **Repository Layer (Acesso a Dados)**

**Padrão:** Encapsulamento completo do Prisma

**Responsabilidades:**

- ✅ Operações de CRUD
- ✅ Queries complexas
- ✅ Transações
- ✅ Mapeamento de dados

**Exemplo:**

```typescript
export async function createOrganizationRepository({
  userId,
  name,
  domain,
  slug,
}: CreateOrganizationRepository) {
  return await prisma.organization.create({
    data: {
      name,
      domain,
      slug,
      ownerId: userId,
      members: { create: { userId, role: "ADMIN" } },
    },
  });
}
```

## 🎯 Padrões Específicos Implementados

### 1. **Plugin-Based Architecture (Fastify)**

```typescript
// Middleware como plugins reutilizáveis
export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);
  });
});
```

### 2. **Schema-First Design**

```typescript
// Schemas Zod definem contratos API
export const createOrganizationSchema = {
  tags: ["organizations"],
  summary: "Create a new organization",
  body: z.object({
    name: z.string(),
    domain: z.string().nullish(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({ organizationId: z.string().uuid() }),
    }),
  },
};
```

### 3. **Multi-Tenant Architecture**

```typescript
// Isolamento automático por organização
const { organization, membership } = await request.getUserMembership(slug);
// Todas as queries são automaticamente scoped por organização
```

### 4. **Request Context Pattern**

```typescript
// Contexto do usuário propagado via request object
const userId = await request.getCurrentUserId();
const { organization, membership } = await request.getUserMembership(slug);
```

## 🔐 Padrões de Segurança

### 1. **JWT-Based Stateless Authentication**

```typescript
// Token minimalista com apenas user ID
const token = await reply.jwtSign({ sub: user.id }, { expiresIn: "7d" });
```

### 2. **RBAC (Role-Based Access Control)**

```typescript
// Verificação granular de permissões
if (membership.role !== "ADMIN") {
  throw new ForbiddenError("Only admins can perform this action");
}
```

### 3. **Auto-Join por Domínio**

```typescript
// Feature de negócio implementada na camada de service
const [_, domain] = email.split("@");
const autoJoinOrganization = await prisma.organization.findFirst({
  where: { domain, shouldAttachUsersByDomain: true },
});
```

## 📋 Princípios de Código

### 1. **Functional Programming Style**

- ✅ Services como funções puras
- ✅ Composição > herança
- ✅ Immutabilidade preferida
- ✅ Side-effects controlados

### 2. **Type-First Development**

- ✅ TypeScript explícito (sem `any`)
- ✅ Zod para runtime validation
- ✅ Prisma para type-safe database
- ✅ Schemas como contratos

### 3. **Error-First Pattern**

```typescript
// Custom error classes com statusCode HTTP
export class NotFoundError extends Error {
  public statusCode = 404;
  constructor(message = "Not Found") {
    super(message);
  }
}
```

### 4. **Consistent Response Pattern**

```typescript
// Padronização total de responses
return reply.status(201).send({
  message: "Operation completed successfully",
  data: { result },
});
```

## 🎖️ Princípios Arquiteturais Seguidos

1. **📦 Single Responsibility**: Cada camada tem responsabilidade específica
2. **🔄 Dependency Inversion**: Camadas superiores não dependem de implementações
3. **🎯 Separation of Concerns**: Apresentação, lógica e dados completamente separados
4. **📐 Convention over Configuration**: Estrutura de pastas e nomenclatura padronizada
5. **🔒 Security by Design**: Autenticação/autorização em todas as camadas
6. **📊 Schema-Driven**: Validação e documentação automática
7. **🧪 Testability**: Cada camada testável isoladamente
8. **🔧 Maintainability**: Fácil localização e modificação de funcionalidades

## 🚀 Benefícios da Arquitetura

### Para Desenvolvimento

✅ **Manutenibilidade**: Localização rápida de funcionalidades  
✅ **Testabilidade**: Testes unitários e integração isolados  
✅ **Type Safety**: TypeScript + Zod + Prisma  
✅ **Developer Experience**: Hot reload, documentação automática  
✅ **Debugging**: Logs estruturados e error handling consistente

### Para Produto

✅ **Escalabilidade**: Stateless, permite scaling horizontal  
✅ **Performance**: Fastify + Prisma otimizados  
✅ **Segurança**: RBAC granular e JWT stateless  
✅ **Multi-tenancy**: Isolamento automático por organização  
✅ **Extensibilidade**: Plugin system e camadas bem definidas

### Para Negócio

✅ **Time to Market**: Boilerplate pronto para SaaS  
✅ **Compliance**: RBAC robusto para auditoria  
✅ **Integração**: APIs bem documentadas e versionadas  
✅ **Monitoramento**: Logs estruturados e métricas automáticas

---

**💡 Resultado**: Uma arquitetura moderna que combina **Clean Architecture** com **padrões específicos do ecossistema Node.js/TypeScript**, otimizada para **SaaS multi-tenant** com **RBAC robusto**.

## 🗄️ Database Schema

### Principais Entidades

- **User**: Autenticação, perfil
- **Organization**: Multi-tenant
- **Member**: Junction User ↔ Organization com role
- **Project**: Pertence a Organization e User
- **Invite**: Sistema de convites
- **Account**: OAuth providers
- **Token**: Password recovery

### Relacionamentos Chave

```prisma
model User {
  organizations_owned Organization[]
  memberships         Member[]
  projects_owned      Project[]
  // ...
}

model Organization {
  owner    User      @relation(fields: [ownerId], references: [id])
  members  Member[]
  projects Project[]
  // ...
}

model Member {
  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])
  role           Role
  // ...
}
```

### Auto-Join por Domínio

```typescript
// Em create-user-account.route.ts
const [_, domain] = email.split("@");

const autoJoinOrganization = await prisma.organization.findFirst({
  where: {
    domain,
    shouldAttachUsersByDomain: true,
  },
});

// Auto-adiciona usuário como membro se organização permitir
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("createOrganizationService", () => {
  it("should create organization with slug", async () => {
    // Arrange
    const userId = "user-id";
    const name = "Test Org";

    // Act
    const result = await createOrganizationService({ userId, name });

    // Assert
    expect(result.slug).toBe("test-org");
  });
});
```

### Integration Tests

```typescript
describe("POST /organizations", () => {
  it("should create organization", async () => {
    const response = await request(app)
      .post("/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Org" });

    expect(response.status).toBe(201);
    expect(response.body.data.organizationId).toBeDefined();
  });
});
```

## 🚀 Build & Deploy

### Development

```bash
# Root
pnpm dev

# Backend only
cd apps/api && pnpm dev

# Frontend only
cd apps/web && pnpm dev
```

### Environment Variables

```bash
# apps/api/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
GITHUB_OAUTH_CLIENT_ID="..."
GITHUB_OAUTH_CLIENT_SECRET="..."
```

### Database Operations

```bash
# Generate Prisma client
cd apps/api && pnpm db:generate

# Run migrations
cd apps/api && pnpm db:migrate

# Reset database
cd apps/api && pnpm db:reset
```

## 📚 Resources

### Fastify Docs

- [Official Documentation](https://fastify.dev/)
- [TypeScript Support](https://fastify.dev/docs/latest/Reference/TypeScript/)
- [Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)

### Prisma Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

### Project-Specific Patterns

- Use async/await consistently
- Always validate input with Zod
- Structure responses with `message` + `data`
- Use custom error classes with statusCode
- Organize imports: external libs → internal modules → relative paths
