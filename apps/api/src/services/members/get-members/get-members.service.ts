import { getMembersByOrganizationRepository } from "@/repositories/members/get-members-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";

type GetMembersServiceParams = {
  userId: string;
  organizationSlug: string;
};

export async function getMembersService({
  userId,
  organizationSlug,
}: GetMembersServiceParams) {
  const { organization, membership } = await getUserMembershipOrganization({
    userId,
    organizationSlug,
  });

  // check user permission to get members
  const { cannot } = getUserPermissions(userId, membership.role);

  if (cannot("get", "User")) {
    throw new ForbiddenError("User does not have permission to get members");
  }
  // end

  const members = await getMembersByOrganizationRepository({
    organizationId: organization.id,
  });

  return members;
}
