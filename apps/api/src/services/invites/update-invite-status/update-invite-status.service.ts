import { InviteStatus } from "@/generated/prisma";
import { updateInviteStatusRepository } from "@/repositories/invites/update-invite-status";

type UpdateInviteStatusService = {
  inviteId: string;
  status: InviteStatus;
  tx?: PrismaTransactionClient;
};

export async function updateInviteStatusService({
  inviteId,
  status,
  tx,
}: UpdateInviteStatusService) {
  const invite = await updateInviteStatusRepository({
    inviteId,
    status,
    tx,
  });

  return invite;
}
