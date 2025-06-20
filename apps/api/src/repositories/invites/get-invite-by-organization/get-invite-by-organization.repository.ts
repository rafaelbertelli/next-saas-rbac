import { prisma } from "@/infra/prisma/prisma-connection";

export async function getInviteByOrganizationRepository(
  organizationId: string,
  inviteId: string
) {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        organizationId,
        id: inviteId,
      },
    });

    return invite;
  } catch (error) {
    throw new Error("Failed to fetch invite");
  }
}
