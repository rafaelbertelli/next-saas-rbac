import { prisma } from "@/infra/prisma/prisma-connection";

export const getMemberByIdRepository = async ({
  memberId,
  organizationId,
}: {
  memberId: string;
  organizationId: string;
}) => {
  try {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
        organizationId,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        organizationId: true,
      },
    });

    return member;
  } catch (error) {
    throw new Error("Failed to get member by id");
  }
};
