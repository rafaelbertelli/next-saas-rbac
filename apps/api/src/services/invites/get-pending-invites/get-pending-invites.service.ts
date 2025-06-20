import { getPendingInvitesByEmailRepository } from "@/repositories/invites/get-pending-invites-by-email";
import { getUserByIdService } from "@/services/users/get-user-by-id";

export async function getPendingInvitesService(userId: string) {
  const user = await getUserByIdService(userId);
  const invites = await getPendingInvitesByEmailRepository(user.email);

  return invites;
}
