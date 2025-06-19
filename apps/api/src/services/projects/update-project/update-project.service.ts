import { getProjectByIdRepository } from "@/repositories/projects/get-project-by-id";
import { updateProjectByIdRepository } from "@/repositories/projects/update-project-by-id";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { projectSchema } from "@repo/auth";

type UpdateProjectServiceParams = {
  userId: string;
  organizationSlug: string;
  projectId: string;
  name?: string;
  description?: string;
  avatarUrl?: string | null;
};

export async function updateProjectService({
  userId,
  organizationSlug,
  projectId,
  name,
  description,
  avatarUrl,
}: UpdateProjectServiceParams) {
  const { organization, membership } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  // check user permission to update a project
  const { cannot } = getUserPermissions(userId, membership.role);
  const authProject = projectSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("update", authProject)) {
    throw new ForbiddenError(
      "User does not have permission to update this project"
    );
  }
  // end

  // Verify if project exists in the organization
  const existingProject = await getProjectByIdRepository({
    projectId,
    organizationId: organization.id,
  });

  if (!existingProject) {
    throw new NotFoundError("Project not found");
  }

  const updatedProject = await updateProjectByIdRepository({
    projectId,
    name,
    description,
    avatarUrl,
  });

  return updatedProject;
}
