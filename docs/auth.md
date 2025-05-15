# Autenticação & Autorização

## Fluxo de Autenticação

- O usuário pode autenticar via e-mail/senha ou Github OAuth.
- Após login, um JWT é emitido e deve ser enviado no header Authorization (Bearer) nas requisições protegidas.

## Middleware de Autenticação

- O middleware `authMiddleware` adiciona métodos ao objeto `request`:

  - `getCurrentUserId()`: retorna o ID do usuário autenticado
  - `getUserMembership(organizationSlug)`: retorna um objeto com os dados da organização e do vínculo do usuário (membership), incluindo a role

    - Exemplo de retorno:

      ```json
      {
        "organization": {
          /* dados da organização */
        },
        "membership": {
          "id": "...",
          "role": "ADMIN"
        }
      }
      ```

- Rotas protegidas usam esses métodos para validar permissões.

## Exemplo de Login

```http
POST /session/email-and-password
{
  "email": "user@email.com",
  "password": "senha"
}
```

Resposta:

```json
{
  "message": "Logged in successfully",
  "data": { "token": "...jwt..." }
}
```

## Proteção de Rotas

- Rotas sensíveis usam o middleware de autenticação.
- O papel do usuário é verificado antes de permitir ações administrativas.

## Fluxo de Autorização (RBAC)

- Cada rota pode exigir um papel específico (ex: ADMIN, MEMBER, BILLING).
- O controle é feito via checagem do papel retornado por `getUserMembership`.
