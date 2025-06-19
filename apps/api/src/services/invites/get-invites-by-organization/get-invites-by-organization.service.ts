import { getInvitesByOrganizationRepository } from "@/repositories/invites/get-invites-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";

type GetOrganizationInvitesService = {
  organizationSlug: string;
  userId: string;
};

export async function getInvitesByOrganizationService({
  organizationSlug,
  userId,
}: GetOrganizationInvitesService) {
  const { membership, organization } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  // Check user permission
  const { cannot } = getUserPermissions(userId, membership.role);

  if (cannot("get", "Invite")) {
    throw new ForbiddenError("User does not have permission to view invites");
  }

  const invites = await getInvitesByOrganizationRepository(organization.id);

  return invites;
}
