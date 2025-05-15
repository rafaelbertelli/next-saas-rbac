import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";
import z from "zod";
import { User } from "./models/user";
import { permissions } from "./permissions";
import { BillingSubject } from "./subjects/billing";
import { InviteSubject } from "./subjects/invite";
import { OrganizationSubject } from "./subjects/organization";
import { ProjectSubject } from "./subjects/project";
import { UserSubject } from "./subjects/user";

const AppAbilities = z.union([
  UserSubject,
  ProjectSubject,
  OrganizationSubject,
  BillingSubject,
  InviteSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
]);

type AppAbilities = z.infer<typeof AppAbilities>;
export type AppAbility = MongoAbility<AppAbilities>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility);

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Trying to use unknown role "${user.role}"`);
  }

  permissions[user.role](user, builder);

  const ability = builder.build({
    detectSubjectType: (subject) => subject.__typename,
  });

  return ability;
}

export * from "./models/organization";
export * from "./models/project";
export * from "./models/role";
export * from "./models/user";
