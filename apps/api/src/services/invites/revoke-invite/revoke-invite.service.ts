import { deleteInviteRepository } from "@/repositories/invites/delete-invite";
import { getInviteByOrganizationRepository } from "@/repositories/invites/get-invite-by-organization";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";

type RevokeInviteService = {
  inviteId: string;
  organizationSlug: string;
  userId: string;
};

export async function revokeInviteService({
  inviteId,
  organizationSlug,
  userId,
}: RevokeInviteService) {
  const { membership, organization } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  // Check user permission
  const { cannot } = getUserPermissions(userId, membership.role);

  if (cannot("delete", "Invite")) {
    throw new ForbiddenError("User does not have permission to revoke invites");
  }

  // Get invite
  const invite = await getInviteByOrganizationRepository(
    organization.id,
    inviteId
  );

  if (!invite) {
    throw new NotFoundError("Invite not found");
  }

  // Check if invite belongs to the organization
  if (invite.organizationId !== organization.id) {
    throw new BadRequestError("Invite does not belong to this organization");
  }

  if (invite.status !== "PENDING") {
    throw new BadRequestError("Only pending invites can be revoked");
  }

  // Delete invite
  await deleteInviteRepository(inviteId);
}
