import { Role } from "@/generated/prisma";
import { defineAbilityFor, userSchema } from "@repo/auth";

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({ id: userId, role: role });
  const { can, cannot } = defineAbilityFor(authUser);
  return { can, cannot };
}
