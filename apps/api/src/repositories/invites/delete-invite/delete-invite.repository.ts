import { prisma } from "@/infra/prisma/prisma-connection";

export async function deleteInviteRepository(inviteId: string) {
  try {
    const invite = await prisma.invite.delete({
      where: {
        id: inviteId,
      },
    });

    return invite;
  } catch (error) {
    throw new Error("Failed to delete invite");
  }
}
