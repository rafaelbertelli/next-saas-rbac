# Next.js SaaS + RBAC

This project contains all the necessary boilerplate to setup a multi-tenant SaaS with Next.js including authentication and RBAC authorization.

## Features

### Authentication

- [x] It should be able to authenticate using e-mail & password;
- [x] It should be able to authenticate using Github account;
- [ ] It should be able to recover password using e-mail;
- [x] It should be able to create an account (e-mail, name and password);

### Organizations

- [x] It should be able to create a new organization;
- [x] It should be able to get organizations to which the user belongs;
- [ ] It should be able to update an organization;
- [ ] It should be able to shutdown an organization;
- [ ] It should be able to transfer organization ownership;

### Invites

- [ ] It should be able to invite a new member (e-mail, role);
- [ ] It should be able to accept an invite;
- [ ] It should be able to revoke a pending invite;

### Members

- [ ] It should be able to get organization members;
- [ ] It should be able to update a member role;

### Projects

- [ ] It should be able to get projects within a organization;
- [ ] It should be able to create a new project (name, url, description);
- [ ] It should be able to update a project (name, url, description);
- [ ] It should be able to delete a project;

### Billing

- [ ] It should be able to get billing details for organization ($20 per project / $10 per member excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Admin
- Member
- Billing (one per organization)

> The "Owner" is not a separate role, but a condition: the user whose id matches the `ownerId` field of the organization. Some actions (like transferring ownership) are restricted to the owner.

### Permissions table

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

> ✅ = allowed | ❌ = not allowed | ⚠️ = allowed w/ conditions

#### Conditions

- Only the user with `ownerId` may transfer organization ownership or delete the organization;
- Only administrators and project authors may update/delete the project;
- Members can leave their own organization;
