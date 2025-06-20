import { InviteStatus } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

type UpdateInviteStatusRepository = {
  inviteId: string;
  status: InviteStatus;
  tx?: PrismaTransactionClient;
};

export async function updateInviteStatusRepository({
  inviteId,
  status,
  tx,
}: UpdateInviteStatusRepository) {
  try {
    const invite = await (tx ?? prisma).invite.update({
      where: {
        id: inviteId,
      },
      data: {
        status,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return invite;
  } catch (error) {
    throw new Error("Failed to update invite status");
  }
}
