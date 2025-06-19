import { getInviteByIdRepository } from "@/repositories/invites/get-invite/get-invite-by-id.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

export async function getInviteService(inviteId: string) {
  const invite = await getInviteByIdRepository(inviteId);

  if (!invite) {
    throw new NotFoundError("Invite not found");
  }

  return invite;
}
