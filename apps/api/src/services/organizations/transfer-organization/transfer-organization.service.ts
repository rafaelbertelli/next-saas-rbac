import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipByUserIdRepository } from "@/repositories/members/get-membership-by-user-id";
import { updateMembershipRepository } from "@/repositories/members/update-membership";
import { updateOrganizationRepository } from "@/repositories/organizations/update-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { organizationSchema } from "@repo/auth";

type TransferOrganization = {
  slug: string;
  userId: string;
  transferToUserId: string;
};

export async function transferOrganizationService({
  slug,
  userId,
  transferToUserId,
}: TransferOrganization) {
  const { membership, organization } = await getUserMembershipOrganization({
    userId,
    organizationSlug: slug,
  });

  // check user permission to transfer organization
  const { cannot } = getUserPermissions(userId, membership.role);
  const authOrganization = organizationSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("update", authOrganization)) {
    throw new ForbiddenError(
      "User does not have permission to transfer organization"
    );
  }
  // end

  // check if target user is a member of the organization
  const transferToUserMembership = await getMembershipByUserIdRepository(
    transferToUserId,
    organization.id
  );

  if (!transferToUserMembership) {
    throw new UnauthorizedError(
      "Target user is not a member of the organization"
    );
  }
  // end

  // transfer organization ownership
  // update target user membership role to admin
  // update organization owner
  // update current user membership role to member
  const result = await prisma.$transaction(async (tx) => {
    await updateMembershipRepository({
      organizationId: organization.id,
      userId: transferToUserId,
      role: Role.ADMIN,
      tx,
    });
    await updateOrganizationRepository({
      organizationId: organization.id,
      ownerId: transferToUserId,
      tx,
    });
    // para remover a role de admin do usuario atual, descomente o código abaixo
    // await updateMembershipRepository({
    //   organizationId: organization.id,
    //   userId: userId,
    //   role: Role.MEMBER,
    //   tx,
    // });
  });
  // end

  return result;
}
