import { prisma } from "@/infra/prisma/prisma-connection";

export async function findDuplicateOrganizationDomainRepository(
  domain: string,
  organizationSlug: string
) {
  try {
    const duplicateOrganization = await prisma.organization.findFirst({
      where: {
        domain,
        slug: {
          not: organizationSlug,
        },
      },
    });

    return duplicateOrganization;
  } catch (error) {
    throw new Error("Error finding duplicate organization domain");
  }
}
