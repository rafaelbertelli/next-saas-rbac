import { getMemberByIdRepository } from "@/repositories/members/get-member-by-id/get-member-by-id.repository";
import { removeMembershipRepository } from "@/repositories/members/remove-membership/remove-membership.repository";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";

type RemoveMemberServiceParams = {
  userId: string;
  organizationSlug: string;
  memberId: string;
};

export async function removeMemberService({
  userId,
  organizationSlug,
  memberId,
}: RemoveMemberServiceParams) {
  const { organization, membership } = await getUserMembershipOrganization({
    userId,
    organizationSlug,
  });

  // check user permission to remove members
  const { cannot } = getUserPermissions(userId, membership.role);

  if (cannot("delete", "User")) {
    throw new ForbiddenError("User does not have permission to remove member");
  }
  // end

  // Get member to be removed
  const memberToRemove = await getMemberByIdRepository({
    memberId,
    organizationId: organization.id,
  });

  if (!memberToRemove) {
    throw new NotFoundError("Member not found");
  }

  const removedMember = await removeMembershipRepository({
    organizationId: organization.id,
    memberId,
  });

  return removedMember;
}
