import { prisma } from "@/infra/prisma/prisma-connection";

type GetProjectBySlugRepositoryParams = {
  slug: string;
  organizationId: string;
};

export async function getProjectBySlugRepository({
  slug,
  organizationId,
}: GetProjectBySlugRepositoryParams) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        slug,
        organization: {
          id: organizationId,
        },
      },
      include: {
        organization: true,
        owner: true,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to get project by slug");
  }
}
