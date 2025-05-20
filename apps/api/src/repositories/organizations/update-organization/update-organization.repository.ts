import { prisma } from "@/infra/prisma/prisma-connection";

type UpdateOrganizationRepository = {
  organizationId: string;
  name?: string;
  domain?: string | null;
  shouldAttachUsersByDomain?: boolean;
  ownerId?: string;
  tx?: PrismaTransactionClient;
};

export async function updateOrganizationRepository({
  organizationId,
  name,
  domain,
  shouldAttachUsersByDomain,
  ownerId,
  tx,
}: UpdateOrganizationRepository) {
  try {
    const updatedOrganization = await (tx ?? prisma).organization.update({
      where: {
        id: organizationId,
      },
      data: {
        ...(name && { name }),
        ...(domain && { domain }),
        ...(shouldAttachUsersByDomain && { shouldAttachUsersByDomain }),
        ...(ownerId && { ownerId }),
      },
    });

    return updatedOrganization;
  } catch (error) {
    throw new Error("Error updating organization");
  }
}
