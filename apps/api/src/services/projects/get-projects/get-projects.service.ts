import { getProjectsByOrganizationRepository } from "@/repositories/projects/get-projects-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { projectSchema } from "@repo/auth";

type GetProjectsServiceParams = {
  userId: string;
  organizationSlug: string;
};

export async function getProjectsService({
  userId,
  organizationSlug,
}: GetProjectsServiceParams) {
  const { organization, membership } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  // check user permission to get projects
  const { cannot } = getUserPermissions(userId, membership.role);
  const authProject = projectSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("get", authProject)) {
    throw new ForbiddenError(
      "User does not have permission to get projects from this organization"
    );
  }
  // end

  const projects = await getProjectsByOrganizationRepository({
    organizationId: organization.id,
  });

  return projects;
}
