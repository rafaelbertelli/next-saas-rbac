# AI Agent Instructions for next-saas-rbac

## Project Overview

This is a multi-tenant SaaS boilerplate built with Next.js, Fastify, and RBAC. Key features include:

- Multi-tenant organizations with projects
- Role-based access control (RBAC)
- Authentication (email/password + OAuth)
- Member management and invites
- Billing structure per project/member

## Architecture & Structure

### Monorepo Organization (Turborepo)

- `apps/api/`: Fastify backend with Prisma ORM
- `apps/web/`: Next.js 14 frontend with App Router
- `packages/auth/`: Shared RBAC logic
- `packages/env/`: Environment configuration
- `packages/ui/`: Shared UI components

### Backend Architecture (apps/api)

```
Routes → Services → Repositories → Database
```

- Uses layered architecture pattern
- Models split into separate .prisma files in `prisma/models/`
- Routes follow RESTful conventions
- Services contain core business logic
- Repositories handle data access via Prisma

### Frontend Architecture (apps/web)

- Next.js 14 with App Router
- Tailwind CSS + shadcn/ui components
- State management via React Context
- Custom fetch abstraction for HTTP calls

## Development Workflows

### Setup & Running

```bash
pnpm install        # Install dependencies
pnpm dev           # Start development servers
pnpm build         # Build all packages
pnpm test          # Run tests
```

### Testing Patterns

- Test files co-located with source: `*.spec.ts`
- Use Jest for unit tests
- React Testing Library for component tests
- Mock Prisma using explicit jest.mock()

## Key Conventions

### Data Models

- UUIDs for IDs
- Timestamps: `created_at`/`updated_at`
- Snake case for DB columns
- Relations through explicit foreign keys
- Example: See `apps/api/prisma/models/organization.prisma`

### API Patterns

- Zod schemas for validation
- Error responses follow standard format
- JWT-based authentication
- Request flow: auth → validation → business logic

### Frontend Patterns

- Page components in `app/` directory
- Shared components in `components/`
- Utility hooks in `hooks/`
- HTTP client abstractions in `http/`

## Common Tasks

### Adding New Features

1. Define Prisma models in `apps/api/prisma/models/`
2. Create repository layer for data access
3. Implement service layer business logic
4. Add route handlers
5. Implement frontend components/pages
6. Add tests following existing patterns

### RBAC Changes

- Permissions defined in `packages/auth/`
- Update both backend checks and frontend UI
