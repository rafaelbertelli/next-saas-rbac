import { createProjectRepository } from "@/repositories/projects/create-project";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { createSlug } from "@/utils/slug/create-slug";
import { projectSchema } from "@repo/auth";

type CreateProjectServiceParams = {
  userId: string;
  slug: string;
  name: string;
  description: string;
};

export async function createProjectService({
  userId,
  slug,
  name,
  description,
}: CreateProjectServiceParams) {
  const { organization, membership } = await getUserMembershipOrganization({
    userId,
    organizationSlug: slug,
  });

  // check user permission to create a project
  const { cannot } = getUserPermissions(userId, membership.role);
  const authProject = projectSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("create", authProject)) {
    throw new ForbiddenError(
      "User does not have permission to create a project"
    );
  }
  // end

  const projectSlug = createSlug(name);
  const project = await createProjectRepository({
    organizationId: organization.id,
    name,
    description,
    slug: projectSlug,
    ownerId: userId,
  });

  return project;
}
