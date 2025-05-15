# Database Relationship Documentation

This document outlines the database schema and relationships for the Next.js SaaS RBAC application.

## Entities

### User

- Primary entity for user authentication and profile
- Owns organizations, projects and can be a member of organizations
- Has authentication tokens and account connections

### Organization

- Represents a team or company
- Has members with different roles
- Contains projects and billing information
- Can send invites to new members

### Member

- Junction entity connecting Users to Organizations
- Defines user roles within an organization

### Project

- Belongs to an Organization
- Has an owner (User)
- Contains project details

### Invite

- Used for inviting users to an Organization
- Tracks who sent the invite

### Account

- Represents external authentication providers
- Connected to a User

### BillingInfo

- Contains billing information for an Organization

### Token

- Authentication tokens for features like password recovery

## Relationships

### User Relationships

- **One-to-Many**:

  - User → Organizations (as owner)
  - User → Projects (as owner)
  - User → Invites (as inviter)
  - User → Tokens
  - User → Accounts

- **Many-to-Many**:
  - User ↔ Organizations (through Member)

### Organization Relationships

- **One-to-Many**:

  - Organization → Projects
  - Organization → Members
  - Organization → Invites

- **One-to-One**:
  - Organization → BillingInfo
  - Organization → User (as owner)

### Other Relationships

- Project belongs to both an Organization and a User (owner)
- Invite is linked to an Organization and optionally to a User (inviter)
- Account is linked to a User
- Token is linked to a User

## Entity Relationship Diagram

```diagram
User 1──┬──* Token
        │
        ├──* Account
        │
        ├──* Project
        │
        ├─┬─* Member
        │ │
        │ │    ┌──1 BillingInfo
        │ │    │
Organization *─┼──1 User (owner)
        │      │
        └──────┘
        │
        └──* Invite
```

> See the [mermaid diagram from database-diagram.mmd](/entity-relationship/database-diagram.mmd) with [mermaid.live](https://mermaid.live/)

## Enums

### Role

- `ADMIN`: Administrator access
- `MEMBER`: Standard member access
- `BILLING`: Billing-only access

> The "Owner" is not a separate role, but a condition: the user whose id matches the `ownerId` field of the organization. Some actions (like transferring ownership) are restricted to the owner.

### TokenType

- `PASSWORD_RECOVER`: Used for password recovery

### AccountProvider

- `GITHUB`: GitHub OAuth provider
