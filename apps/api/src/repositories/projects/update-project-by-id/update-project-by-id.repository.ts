import { prisma } from "@/infra/prisma/prisma-connection";

type UpdateProjectByIdRepositoryParams = {
  projectId: string;
  name?: string;
  description?: string;
  avatarUrl?: string | null;
};

export async function updateProjectByIdRepository({
  projectId,
  name,
  description,
  avatarUrl,
}: UpdateProjectByIdRepositoryParams) {
  try {
    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to update project by id");
  }
}
