import { prisma } from "@/infra/prisma/prisma-connection";

type UpdateOrganizationRepository = {
  organizationId: string;
  name?: string;
  domain?: string | null;
  shouldAttachUsersByDomain?: boolean;
};

export async function updateOrganizationRepository({
  organizationId,
  name,
  domain,
  shouldAttachUsersByDomain,
}: UpdateOrganizationRepository) {
  try {
    const updatedOrganization = await prisma.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(shouldAttachUsersByDomain && { shouldAttachUsersByDomain }),
      },
    });

    return updatedOrganization;
  } catch (error) {
    throw new Error("Error updating organization");
  }
}
