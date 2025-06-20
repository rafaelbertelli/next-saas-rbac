import { getInviteByIdRepository } from "@/repositories/invites/get-invite";
import { updateInviteStatusRepository } from "@/repositories/invites/update-invite-status";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserByIdService } from "@/services/users/get-user-by-id";

type RejectInviteService = {
  inviteId: string;
  userId: string;
};

export async function rejectInviteService({
  inviteId,
  userId,
}: RejectInviteService) {
  const invite = await getInviteByIdRepository(inviteId);

  if (!invite) {
    throw new NotFoundError("Invite not found");
  }

  if (invite.status !== "PENDING") {
    throw new BadRequestError("Invite is no longer valid");
  }

  const user = await getUserByIdService(userId);

  // Check if email matches (security measure)
  if (invite.email !== user.email) {
    throw new BadRequestError(
      "You can only reject invites sent to your email address"
    );
  }

  // Update invite status
  const updatedInvite = await updateInviteStatusRepository({
    inviteId,
    status: "REJECTED",
  });

  return updatedInvite;
}
