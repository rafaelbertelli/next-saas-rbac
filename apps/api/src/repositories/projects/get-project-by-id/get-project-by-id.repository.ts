import { prisma } from "@/infra/prisma/prisma-connection";

type GetProjectByIdRepositoryParams = {
  projectId: string;
  organizationId: string;
};

export async function getProjectByIdRepository({
  projectId,
  organizationId,
}: GetProjectByIdRepositoryParams) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        organizationId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to get project by id");
  }
}
