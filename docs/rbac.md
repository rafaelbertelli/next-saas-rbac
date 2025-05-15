# RBAC & Permissões

## Papéis (Roles)

- **Admin**: Administrador da organização (pode gerenciar membros, projetos e configurações, com restrições para ações de owner)
- **Member**: Membro padrão
- **Billing**: Acesso apenas a informações de cobrança

> O papel de "Owner" é representado pelo usuário que possui o campo `ownerId` na organização. Não é um role separado, mas sim uma condição especial para algumas permissões (ex: transferir ownership).

## Tabela de Permissões

|                        | Admin | Member | Billing |
| ---------------------- | ----- | ------ | ------- |
| Update organization    | ⚠️    | ❌     | ❌      |
| Delete organization    | ⚠️    | ❌     | ❌      |
| Invite a member        | ✅    | ❌     | ❌      |
| Revoke an invite       | ✅    | ❌     | ❌      |
| List members           | ✅    | ✅     | ✅      |
| Transfer ownership     | ⚠️    | ❌     | ❌      |
| Update member role     | ✅    | ❌     | ❌      |
| Delete member          | ✅    | ⚠️     | ❌      |
| List projects          | ✅    | ✅     | ✅      |
| Create a new project   | ✅    | ✅     | ❌      |
| Update a project       | ✅    | ⚠️     | ❌      |
| Delete a project       | ✅    | ⚠️     | ❌      |
| Get billing details    | ✅    | ❌     | ✅      |
| Export billing details | ✅    | ❌     | ✅      |

> ✅ = permitido | ❌ = não permitido | ⚠️ = permitido com restrições

## Exemplos Práticos

- Apenas o usuário com `ownerId` pode transferir ownership ou deletar a organização
- Apenas administradores e autores podem editar/deletar projetos
- Membros podem sair da organização

## Como evoluir o RBAC

- Para adicionar um novo papel, defina no enum `Role` e atualize a tabela de permissões
- Para novas permissões, adicione checagens nas rotas e atualize a documentação
