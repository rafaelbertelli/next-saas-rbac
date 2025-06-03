import { prisma } from "@/infra/prisma/prisma-connection";

type GetMembersByOrganizationRepositoryParams = {
  organizationId: string;
};

export async function getMembersByOrganizationRepository({
  organizationId,
}: GetMembersByOrganizationRepositoryParams) {
  try {
    const members = await prisma.member.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });

    const membersWithPermissions = members.map((member) => {
      const { user, ...rest } = member;
      return {
        ...rest,
        user: user,
      };
    });

    return membersWithPermissions;
  } catch (error) {
    throw new Error("Failed to get members by organization");
  }
}
