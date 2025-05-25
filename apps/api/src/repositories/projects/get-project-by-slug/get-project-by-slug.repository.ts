import { prisma } from "@/infra/prisma/prisma-connection";

type GetProjectBySlugRepositoryParams = {
  slug: string;
};

export async function getProjectBySlugRepository({
  slug,
}: GetProjectBySlugRepositoryParams) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        slug,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to get project by slug");
  }
}
