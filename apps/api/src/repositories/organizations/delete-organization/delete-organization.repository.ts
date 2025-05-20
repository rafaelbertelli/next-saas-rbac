import { prisma } from "@/infra/prisma/prisma-connection";

type DeleteOrganizationRepository = {
  organizationId: string;
};

export async function deleteOrganizationRepository({
  organizationId,
}: DeleteOrganizationRepository) {
  try {
    const updatedOrganization = await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return updatedOrganization;
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting organization");
  }
}
