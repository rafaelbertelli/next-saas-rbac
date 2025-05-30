import { prisma } from "@/infra/prisma/prisma-connection";

type GetProjectsByOrganizationRepositoryParams = {
  organizationId: string;
};

export async function getProjectsByOrganizationRepository({
  organizationId,
}: GetProjectsByOrganizationRepositoryParams) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        ownerId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        owner: {
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

    return projects;
  } catch (error) {
    throw new Error("Failed to get projects by organization");
  }
}
