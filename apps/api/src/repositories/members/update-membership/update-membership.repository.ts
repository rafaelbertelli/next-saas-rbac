import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

export const updateMembershipRepository = async ({
  organizationId,
  userId,
  role,
  tx,
}: {
  organizationId: string;
  userId: string;
  role: Role;
  tx?: PrismaTransactionClient;
}) => {
  try {
    const updatedMembership = await (tx ?? prisma).member.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: {
        role,
      },
    });

    return updatedMembership;
  } catch (error) {
    throw new Error("Failed to update membership");
  }
};
