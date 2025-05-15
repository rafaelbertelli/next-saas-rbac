import { prisma } from "@/infra/prisma/prisma-connection";

export async function getOrganizationBySlugRepository(slug: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    return organization;
  } catch (error) {
    throw new Error("Failed to get organization by slug");
  }
}
