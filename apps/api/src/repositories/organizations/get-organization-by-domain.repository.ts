import { prisma } from "@/infra/prisma/prisma-connection";

export async function getOrganizationByDomainRepository(domain: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: {
        domain,
      },
    });

    return organization;
  } catch (error) {
    throw new Error("Failed to get organization by domain");
  }
}
