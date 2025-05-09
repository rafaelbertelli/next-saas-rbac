import { defineAbilityFor, projectSchema } from "@repo/auth";

const ability = defineAbilityFor({
  role: "MEMBER",
  id: "user-id",
});
const project = projectSchema.parse({
  id: "project-id",
  ownerId: "user-id",
});

console.log(ability.can("get", "User"));

console.log(ability.can("create", "Invite"));

console.log(ability.can("update", "Organization"));

console.log(ability.can("manage", "Billing"));

console.log(ability.can("delete", project));
