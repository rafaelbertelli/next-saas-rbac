# API Reference

## Endpoints Principais

### 🔐 Autenticação

#### Login por E-mail/Senha

```http
POST /session/email-and-password
```

**Request:**

```json
{
  "email": "user@email.com",
  "password": "senha123"
}
```

**Response:**

```json
{
  "message": "Logged in successfully",
  "data": { "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

#### Login via Github

```http
POST /session/authenticate-with-github
```

**Request:**

```json
{
  "code": "github_oauth_code"
}
```

#### Recuperar Senha

```http
POST /session/password-recover
```

**Request:**

```json
{
  "email": "user@email.com"
}
```

#### Reset de Senha

```http
POST /session/password-reset
```

**Request:**

```json
{
  "code": "token_id",
  "password": "nova_senha"
}
```

### 👤 Usuários

#### Criar Conta

```http
POST /users
```

**Request:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### Perfil do Usuário

```http
GET /users
```

**Response:**

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "avatarUrl": "https://..."
    }
  }
}
```

### 🏢 Organizações

#### Criar Organização

```http
POST /organizations
```

**Request:**

```json
{
  "name": "Minha Empresa",
  "domain": "minhaempresa.com",
  "shouldAttachUsersByDomain": true
}
```

#### Listar Organizações do Usuário

```http
GET /organizations
```

**Response:**

```json
{
  "message": "Organizations retrieved successfully",
  "data": {
    "organizations": [
      {
        "id": "uuid",
        "name": "Minha Empresa",
        "slug": "minha-empresa",
        "domain": "minhaempresa.com",
        "avatarUrl": null,
        "role": "ADMIN"
      }
    ]
  }
}
```

#### Buscar Organização por Slug

```http
GET /organizations/:slug
```

#### Atualizar Organização

```http
PUT /organizations/:slug
```

**Request:**

```json
{
  "name": "Novo Nome",
  "domain": "novodominio.com",
  "shouldAttachUsersByDomain": false
}
```

#### Deletar Organização

```http
DELETE /organizations/:slug
```

#### Transferir Propriedade

```http
PATCH /organizations/:slug/owner
```

**Request:**

```json
{
  "transferToUserId": "uuid-do-novo-owner"
}
```

#### Buscar Membership

```http
GET /organizations/:slug/membership
```

**Response:**

```json
{
  "message": "Membership retrieved successfully",
  "data": {
    "membership": {
      "id": "uuid",
      "role": "ADMIN"
    },
    "organization": {
      "id": "uuid",
      "name": "Minha Empresa"
    }
  }
}
```

### 📋 Projetos

#### Criar Projeto

```http
POST /organizations/:slug/projects
```

**Request:**

```json
{
  "name": "Meu Projeto",
  "description": "Descrição do projeto",
  "avatarUrl": "https://..."
}
```

#### Buscar Projeto

```http
GET /organizations/:organizationSlug/projects/:projectSlug
```

**Response:**

```json
{
  "message": "Project retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "Meu Projeto",
    "description": "Descrição",
    "avatarUrl": "https://...",
    "slug": "meu-projeto",
    "ownerId": "uuid",
    "organizationId": "uuid",
    "owner": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "avatarUrl": "https://..."
    }
  }
}
```

#### Deletar Projeto

```http
DELETE /organizations/:organizationSlug/projects/:projectSlug
```

## 🔧 Autenticação

### Headers Obrigatórios

Todas as rotas protegidas exigem:

```
Authorization: Bearer <jwt_token>
```

### Códigos de Status

| Código | Significado  | Quando Ocorre                                |
| ------ | ------------ | -------------------------------------------- |
| 200    | OK           | Operação realizada com sucesso               |
| 201    | Created      | Recurso criado com sucesso                   |
| 204    | No Content   | Operação realizada, sem conteúdo de retorno  |
| 400    | Bad Request  | Dados de entrada inválidos                   |
| 401    | Unauthorized | Token inválido ou ausente                    |
| 403    | Forbidden    | Usuário sem permissão para a operação        |
| 404    | Not Found    | Recurso não encontrado                       |
| 409    | Conflict     | Conflito de dados (ex: e-mail já cadastrado) |

### Estrutura de Erro Padrão

```json
{
  "message": "Descrição do erro",
  "statusCode": 400
}
```

## 📊 Observações Técnicas

- **Datas**: Retornadas em formato ISO string (UTC)
- **UUIDs**: Todos os IDs são UUIDs v4
- **JWT**: Tokens expiram em 7 dias
- **Rate Limiting**: Não implementado ainda
- **Paginação**: Não implementada ainda
