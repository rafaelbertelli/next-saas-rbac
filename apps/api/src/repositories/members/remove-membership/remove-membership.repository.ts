import { prisma } from "@/infra/prisma/prisma-connection";

export const removeMembershipRepository = async ({
  organizationId,
  memberId,
}: {
  organizationId: string;
  memberId: string;
}) => {
  try {
    const deletedMembership = await prisma.member.delete({
      where: {
        id: memberId,
        organizationId,
      },
    });

    return deletedMembership;
  } catch (error) {
    throw new Error("Failed to remove membership");
  }
};
