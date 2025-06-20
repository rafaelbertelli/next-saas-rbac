import { prisma } from "@/infra/prisma/prisma-connection";

export async function getPendingInvitesByEmailRepository(email: string) {
  try {
    const invites = await prisma.invite.findMany({
      where: {
        email,
        status: "PENDING",
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  } catch (error) {
    throw new Error("Failed to fetch pending invites");
  }
}
