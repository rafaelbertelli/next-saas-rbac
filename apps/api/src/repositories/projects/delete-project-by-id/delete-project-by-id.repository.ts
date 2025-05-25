import { prisma } from "@/infra/prisma/prisma-connection";

type DeleteProjectByIdRepositoryParams = {
  id: string;
};

export async function deleteProjectByIdRepository({
  id,
}: DeleteProjectByIdRepositoryParams) {
  try {
    const project = await prisma.project.delete({
      where: {
        id,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to delete project by id");
  }
}
