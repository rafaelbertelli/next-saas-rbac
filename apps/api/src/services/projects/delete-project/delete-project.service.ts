import { deleteProjectByIdRepository } from "@/repositories/projects/delete-project-by-id";
import { getProjectByIdRepository } from "@/repositories/projects/get-project-by-id";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { projectSchema } from "@repo/auth";

type DeleteProjectServiceParams = {
  userId: string;
  slug: string;
  projectId: string;
};

export async function deleteProjectService({
  userId,
  slug,
  projectId,
}: DeleteProjectServiceParams) {
  const { organization, membership } = await getUserMembershipOrganization({
    userId,
    organizationSlug: slug,
  });

  // check user permission to delete a project
  const { cannot } = getUserPermissions(userId, membership.role);
  const authProject = projectSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("delete", authProject)) {
    throw new ForbiddenError(
      "User does not have permission to delete a project"
    );
  }
  // end

  const project = await getProjectByIdRepository({
    projectId,
    organizationId: organization.id,
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const deletedProject = await deleteProjectByIdRepository({
    id: projectId,
  });

  return deletedProject;
}
