# API

## Endpoints Principais

### Autenticação

- `POST /session/email-and-password` — Login por e-mail/senha
- `POST /session/authenticate-with-github` — Login via Github

### Organizações

- `POST /organizations` — Criar organização
- `GET /organizations/:slug` — Buscar organização por slug
- `GET /organizations` — Listar organizações do usuário

## Exemplo de Request/Response

### Criar Organização

```http
POST /organizations
{
  "name": "Minha Org",
  "domain": "minhaorg.com"
}
```

Resposta:

```json
{
  "message": "Organization created successfully",
  "data": { "organizationId": "uuid" }
}
```

### Buscar Organização

```http
GET /organizations/minhaorg
```

Resposta:

```json
{
  "message": "Organization retrieved successfully",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Minha Org",
      "slug": "minhaorg",
      "domain": "minhaorg.com",
      "avatarUrl": null,
      "shouldAttachUsersByDomain": false,
      "ownerId": "user-uuid",
      "createdAt": "2024-05-01T12:00:00.000Z",
      "updatedAt": "2024-05-01T12:00:00.000Z"
    }
  }
}
```

## Códigos de Erro Comuns

- `401 Unauthorized`: Token inválido ou ausente
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito de dados (ex: e-mail já cadastrado)
- `400 Bad Request`: Dados inválidos

## Observações

- Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`
- Datas são retornadas em formato ISO string
