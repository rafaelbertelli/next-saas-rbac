# Visão Geral

Este projeto é um boilerplate para SaaS multi-tenant com Next.js, autenticação robusta e RBAC (controle de acesso baseado em papéis). Ele foi desenhado para ser escalável, seguro e fácil de evoluir.

## Principais Módulos

- **Autenticação**: Login por e-mail/senha e OAuth (Github)
- **Organizações**: Multi-tenant, cada usuário pode pertencer a várias organizações
- **Membros & Convites**: Gestão de membros, papéis e convites
- **Projetos**: Cada organização pode ter múltiplos projetos
- **Billing**: Estrutura pronta para cobrança por projeto/membro
- **RBAC**: Controle de permissões detalhado por papel

## Arquitetura

- **Backend**: API RESTful com Fastify, Prisma ORM, testes com Jest
- **Frontend**: Next.js, React, integração com design system
- **Banco de Dados**: PostgreSQL (recomendado)

## Como navegar na documentação

- Use o menu lateral para acessar tópicos como entidades, autenticação, API, testes, deploy e RBAC.
- Consulte o diagrama ER para entender o modelo de dados.
- Veja exemplos de uso e fluxos nos tópicos específicos.
