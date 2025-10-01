import { defineAbilityFor } from "@repo/auth";
import { getMembership } from "../organizations/get-membership";

export async function ability() {
  const { user, membership, success } = await getMembership();

  if (!success) {
    return null;
  }

  if (!membership || !user) {
    return null;
  }

  const ability = defineAbilityFor({
    id: user.id,
    role: membership.role,
  });

  return ability;
}
