import { Role } from "@/generated/prisma";
import { updateMembershipRepository } from "@/repositories/members/update-membership/update-membership.repository";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";

type UpdateMemberServiceParams = {
  userId: string;
  organizationSlug: string;
  memberId: string;
  role: Role;
};

export async function updateMemberService({
  userId,
  organizationSlug,
  memberId,
  role,
}: UpdateMemberServiceParams) {
  const { organization, membership } =
    await getUserMembershipOrganizationService({
      userId,
      organizationSlug,
    });

  // check user permission to update members
  const { cannot } = getUserPermissions(userId, membership.role);
  if (cannot("update", "User")) {
    throw new ForbiddenError("User does not have permission to update member");
  }
  // end

  const updatedMember = await updateMembershipRepository({
    organizationId: organization.id,
    memberId,
    role,
  });

  return updatedMember;
}
