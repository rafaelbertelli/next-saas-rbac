import { prisma } from "@/infra/prisma/prisma-connection";

export const getMembershipByUserIdRepository = async (
  userId: string,
  organizationId: string
) => {
  try {
    const membership = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return membership;
  } catch (error) {
    throw new Error("Failed to get membership by user id");
  }
};
