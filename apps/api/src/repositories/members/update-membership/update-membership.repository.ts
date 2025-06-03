import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";

export const updateMembershipRepository = async ({
  organizationId,
  memberId,
  role,
}: {
  organizationId: string;
  memberId: string;
  role: Role;
}) => {
  try {
    const updatedMembership = await prisma.member.update({
      where: {
        id: memberId,
        organizationId,
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
