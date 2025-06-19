import { prisma } from "@/infra/prisma/prisma-connection";

export async function getInviteByIdRepository(inviteId: string) {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        id: inviteId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return invite;
  } catch (error) {
    throw new Error("Failed to fetch invite");
  }
}
