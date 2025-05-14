import prisma from "@/infra/prisma/prisma-connection";

export async function getOrganizationByDomainRepository(domain: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      domain,
    },
  });

  return organization;
}
