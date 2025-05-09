import { AbilityBuilder } from "@casl/ability";
import { AppAbility } from ".";
import { Role } from "./models/role";
import { User } from "./models/user";

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void;

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (user, builder) => {
    builder.can("manage", "all");

    builder.cannot(["transfer_ownership", "update"], "Organization");
    builder.can(["transfer_ownership", "update"], "Organization", {
      ownerId: { $eq: user.id },
    });
  },
  MEMBER: (user, builder) => {
    builder.can("get", "User");

    builder.can(["create", "get"], "Project");
    builder.can(["update", "delete"], "Project", {
      ownerId: { $eq: user.id },
    });
  },
  BILLING: (_, builder) => {
    builder.can("manage", "Billing");
  },
};
