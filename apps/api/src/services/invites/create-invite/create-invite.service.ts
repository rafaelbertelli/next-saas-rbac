import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { createInviteRepository } from "@/repositories/invites/create-invite/create-invite.repository";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";

type CreateInviteService = {
  email: string;
  role: Role;
  organizationSlug: string;
  userId: string;
};

export async function createInviteService({
  email,
  role,
  organizationSlug,
  userId,
}: CreateInviteService) {
  const { membership, organization } = await getUserMembershipOrganization({
    userId,
    organizationSlug,
  });

  // Check user permission
  const { cannot } = getUserPermissions(userId, membership.role);

  if (cannot("create", "Invite")) {
    throw new ForbiddenError("User does not have permission to create invites");
  }

  const [, domain] = email.split("@");

  // Same domain users are added automatically to the organization on login
  if (
    organization.shouldAttachUsersByDomain &&
    organization.domain === domain
  ) {
    throw new BadRequestError(
      `Users with domain ${domain} will be added automatically to the organization on login`
    );
  }

  // Check if user already exists and is already a member
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: {
          organizationId: organization.id,
        },
      },
    },
  });

  if (existingUser && existingUser.memberships.length > 0) {
    throw new ConflictError("User is already a member of this organization");
  }

  // Check if there's already a pending invite
  const existingInvite = await prisma.invite.findFirst({
    where: {
      email,
      organizationId: organization.id,
      status: "PENDING",
    },
  });

  if (existingInvite) {
    throw new ConflictError("User already has a pending invite");
  }

  const invite = await createInviteRepository({
    email,
    role,
    organizationId: organization.id,
    inviterId: userId,
  });

  return invite;
}
