import { prisma } from "@/infra/prisma/prisma-connection";

export const amountOfMembersNotBillableRepository = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  try {
    const amountOfMembers = await prisma.member.count({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });

    return amountOfMembers;
  } catch (error) {
    throw new Error("Failed to get amount of members not billable");
  }
};
