import { prisma } from "@/infra/prisma/prisma-connection";

type CreateProjectRepositoryParams = {
  organizationId: string;
  name: string;
  description: string;
  slug: string;
  ownerId: string;
};

export async function createProjectRepository({
  organizationId,
  name,
  description,
  slug,
  ownerId,
}: CreateProjectRepositoryParams) {
  try {
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        organizationId,
        ownerId,
      },
    });

    return project;
  } catch (error) {
    throw new Error("Failed to create project");
  }
}
