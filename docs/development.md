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

## 🔧 Padrões de Desenvolvimento

### Backend Structure Pattern

#### Organização de Rotas

```
apps/api/src/routes/
├── organizations/
│   ├── create-organization/
│   │   ├── create-organization.route.ts
│   │   ├── schema.ts
│   │   └── index.ts
│   └── get-organization/
│       ├── get-organization.route.ts
│       ├── schema.ts
│       └── index.ts
```

#### Padrão de Route

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

#### Padrão de Schema

```typescript
export const createOrganizationSchema = {
  tags: ["organizations"],
  summary: "Create a new organization",
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string(),
    domain: z.string().nullish(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        organizationId: z.string().uuid(),
      }),
    }),
  },
};
```

### Service Layer Pattern

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

### Repository Pattern

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
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
  });
}
```

## 🔐 Sistema de Autenticação

### JWT Flow

1. Login retorna JWT com `sub` claim (user ID)
2. Middleware `authMiddleware` adiciona `getCurrentUserId()` ao request
3. Rotas protegidas usam `request.getCurrentUserId()`

### Middleware de Autorização

```typescript
export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);
  });
});
```

### RBAC Implementation

```typescript
// Em rotas que precisam de permissão específica
const { organization, membership } = await request.getUserMembership(slug);

if (membership.role !== "ADMIN") {
  throw new ForbiddenError("Only admins can perform this action");
}
```

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
