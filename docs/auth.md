# Autenticação & Autorização

## 🔐 Fluxo de Autenticação

### Métodos de Login Suportados

1. **E-mail e Senha**: Autenticação tradicional com hash bcrypt
2. **GitHub OAuth**: Integração com GitHub via OAuth 2.0
3. **Auto-Join por Domínio**: Usuários podem ser automaticamente adicionados a organizações baseado no domínio do e-mail

### Processo de Autenticação

```
1. Login (email/senha ou GitHub)
   ↓
2. Validação das credenciais
   ↓
3. Geração de JWT (válido por 7 dias)
   ↓
4. Token retornado ao cliente
   ↓
5. Cliente inclui token no header Authorization
```

## 🛡️ Sistema JWT

### Token Structure

```typescript
// Payload do JWT
{
  sub: "user-uuid",           // User ID
  iat: 1672531200,           // Issued at
  exp: 1673136000            // Expires (7 dias)
}
```

### Configuração no Fastify

```typescript
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { algorithm: "HS256" },
});
```

## 🔒 Middleware de Autenticação

O sistema usa um middleware personalizado que:

1. Verifica e decodifica o JWT
2. Adiciona métodos de conveniência ao objeto `request`
3. Permite acesso fácil a dados do usuário autenticado

### Implementação do Middleware

```typescript
export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);
    request.getUserMembership = async (slug) =>
      await getUserMembership(request, slug);
  });
});
```

### Métodos Disponíveis no Request

#### `getCurrentUserId()`

Retorna o ID do usuário autenticado:

```typescript
const userId = await request.getCurrentUserId();
// Retorna: "uuid-do-usuario"
```

#### `getUserMembership(organizationSlug)`

Retorna dados da organização e membership do usuário:

```typescript
const { organization, membership } = await request.getUserMembership("minha-org");

// Retorna:
{
  organization: {
    id: "uuid",
    name: "Minha Organização",
    slug: "minha-org",
    // ... outros campos
  },
  membership: {
    id: "uuid",
    role: "ADMIN" | "MEMBER" | "BILLING"
  }
}
```

## 🎯 Autorização RBAC

### Roles Disponíveis

- **ADMIN**: Acesso total à organização
- **MEMBER**: Acesso limitado, pode gerenciar projetos próprios
- **BILLING**: Acesso apenas a informações de cobrança

### Verificação de Permissões

#### Verificação Simples de Role

```typescript
const { membership } = await request.getUserMembership(slug);

if (membership.role !== "ADMIN") {
  throw new ForbiddenError("Only admins can perform this action");
}
```

#### Verificação de Ownership

```typescript
const { organization } = await request.getUserMembership(slug);
const userId = await request.getCurrentUserId();

if (organization.ownerId !== userId) {
  throw new ForbiddenError("Only organization owner can transfer ownership");
}
```

## 📝 Exemplos Práticos

### Login por E-mail/Senha

```typescript
// Route: POST /session/email-and-password
const user = await prisma.user.findUnique({
  where: { email },
});

if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
  throw new UnauthorizedError("Invalid credentials");
}

const token = await reply.jwtSign(
  { sub: user.id },
  { sign: { expiresIn: "7d" } }
);

return reply.send({
  message: "Logged in successfully",
  data: { token },
});
```

### Rota Protegida Exemplo

```typescript
export async function updateOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware) // ← Aplica middleware de auth
    .put("/organizations/:slug", async (request, reply) => {
      // Verifica permissão
      const { organization, membership } = await request.getUserMembership(
        request.params.slug
      );

      if (membership.role !== "ADMIN") {
        throw new ForbiddenError("Only admins can update organization");
      }

      // Processa a atualização...
    });
}
```

### GitHub OAuth Flow

```typescript
// 1. Frontend redireciona para GitHub
// 2. GitHub retorna code
// 3. Backend troca code por access_token
// 4. Backend busca dados do usuário no GitHub
// 5. Cria ou atualiza usuário local
// 6. Retorna JWT

const githubAccessTokenResponse = await fetch(githubOAuthUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    client_id: env.GITHUB_OAUTH_CLIENT_ID,
    client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
    code,
  }),
});
```

## 🔄 Password Recovery

### Fluxo de Recuperação

1. **Request Recovery**: `POST /session/password-recover`

   - Recebe e-mail do usuário
   - Gera token de recuperação (válido por 10 minutos)
   - Envia e-mail com link (implementação do envio pendente)

2. **Reset Password**: `POST /session/password-reset`
   - Recebe token ID e nova senha
   - Valida token (não expirado e não usado)
   - Atualiza senha do usuário
   - Marca token como usado

### Implementação de Segurança

```typescript
// Não revela se e-mail existe no sistema
if (!userFromEmail) {
  request.log.error({ message: "User not found", email });
  // Retorna 204 mesmo assim (security by obscurity)
  return reply.status(204).send();
}
```

## 🚨 Tratamento de Erros de Auth

### Códigos de Erro Comuns

- `401 Unauthorized`: Token inválido, expirado ou ausente
- `403 Forbidden`: Usuário não tem permissão para a ação
- `404 Not Found`: Organização não encontrada ou usuário não é membro

### Error Classes Customizadas

```typescript
export class UnauthorizedError extends Error {
  public statusCode = 401;
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;
  constructor(message = "Forbidden") {
    super(message);
  }
}
```

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente Necessárias

```bash
JWT_SECRET="your-super-secret-jwt-key"
GITHUB_OAUTH_CLIENT_ID="github-app-client-id"
GITHUB_OAUTH_CLIENT_SECRET="github-app-client-secret"
GITHUB_OAUTH_REDIRECT_URI="http://localhost:3000/auth/github/callback"
GITHUB_OAUTH_GRANTED_ACCESS_URI="https://api.github.com/user"
```

### Headers de Autenticação

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Testando Autenticação

```bash
# Login
curl -X POST http://localhost:3333/session/email-and-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Usando token em rota protegida
curl -X GET http://localhost:3333/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
