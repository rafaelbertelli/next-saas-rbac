import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { addMemberService } from "@/services/members/add-member";
import { getUserByIdService } from "@/services/users/get-user-by-id";
import { getInviteService } from "../get-invite";
import { updateInviteStatusService } from "../update-invite-status";

type AcceptInviteService = {
  userId: string;
  inviteId: string;
};

export async function acceptInviteService({
  userId,
  inviteId,
}: AcceptInviteService) {
  const invite = await getInviteService(inviteId);

  if (invite.status !== "PENDING") {
    throw new BadRequestError("Invite is no longer valid");
  }

  const user = await getUserByIdService(userId);

  // Check if email matches (security measure)
  if (invite.email !== user.email) {
    throw new BadRequestError(
      "You can only accept invites sent to your email address"
    );
  }

  // Check if user is already a member
  const existingMember = await getMembershipBySlugRepository({
    userId,
    organizationSlug: invite.organization.slug,
  });

  if (existingMember) {
    // Update invite status anyway
    // Analisar o caso de o usuário ser um membro e receber um convite para uma organização diferente
    await updateInviteStatusService({
      inviteId,
      status: "ACCEPTED",
    });
    throw new BadRequestError("You are already a member of this organization");
  }

  const result = await prisma.$transaction(async (tx) => {
    await addMemberService({
      userId: user.id,
      organizationId: invite.organizationId,
      role: invite.role,
      tx,
    });
    await updateInviteStatusService({
      inviteId,
      status: "ACCEPTED",
      tx,
    });
  });

  return result;
}
