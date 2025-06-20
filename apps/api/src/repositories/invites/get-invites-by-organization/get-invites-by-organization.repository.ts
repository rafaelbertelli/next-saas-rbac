import { InviteStatus } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

export async function getInvitesByOrganizationRepository(
  organizationId: string,
  status?: InviteStatus
) {
  try {
    const invites = await prisma.invite.findMany({
      where: {
        organizationId,
        ...(status && { status }),
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  } catch (error) {
    throw new Error("Failed to fetch invites");
  }
}
