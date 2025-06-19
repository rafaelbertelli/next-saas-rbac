import { deleteOrganizationRepository } from "@/repositories/organizations/delete-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { organizationSchema } from "@repo/auth";

type ShutdownOrganization = {
  slug: string;
  userId: string;
};

export async function shutdownOrganizationService({
  slug,
  userId,
}: ShutdownOrganization) {
  const { membership, organization } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug: slug,
    });

  // check user permission
  const { cannot } = getUserPermissions(userId, membership.role);
  const authOrganization = organizationSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("delete", authOrganization)) {
    throw new ForbiddenError(
      "User does not have permission to shutdown organization"
    );
  }
  // end

  const deletedOrganization = await deleteOrganizationRepository({
    organizationId: organization.id,
  });

  return deletedOrganization;
}
