import { prisma } from "@/infra/prisma/prisma-connection";

export async function getOrganizationsByUserIdRepository(userId: string) {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        avatarUrl: true,
        members: {
          select: {
            role: true,
          },
          where: {
            userId,
          },
        },
      },
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });

    const organizationsWithUsersRole = organizations.map(
      ({ members, ...organization }) => ({
        ...organization,
        role: members[0]?.role ?? null,
      })
    );

    return organizationsWithUsersRole;
  } catch (error) {
    throw new Error("Failed to get organizations");
  }
}
