import { getProjectBySlugRepository } from "@/repositories/projects/get-project-by-slug";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { projectSchema } from "@repo/auth";

type GetProjectServiceParams = {
  userId: string;
  organizationSlug: string;
  projectSlug: string;
};

export async function getProjectService({
  userId,
  organizationSlug,
  projectSlug,
}: GetProjectServiceParams) {
  const { organization, membership } = await getUserMembershipOrganization({
    userId,
    organizationSlug,
  });

  // check user permission to create a project
  const { cannot } = getUserPermissions(userId, membership.role);
  const authProject = projectSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("get", authProject)) {
    throw new ForbiddenError(
      "User does not have permission to get this project"
    );
  }
  // end

  const project = await getProjectBySlugRepository({
    slug: projectSlug,
    organizationId: organization.id,
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
}
