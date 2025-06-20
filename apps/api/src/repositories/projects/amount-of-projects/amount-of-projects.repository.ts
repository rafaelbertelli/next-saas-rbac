import { prisma } from "@/infra/prisma/prisma-connection";

export const amountOfProjectsRepository = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  try {
    const amountOfProjects = await prisma.project.count({
      where: {
        organizationId,
      },
    });

    return amountOfProjects;
  } catch (error) {
    throw new Error("Failed to get amount of projects");
  }
};
