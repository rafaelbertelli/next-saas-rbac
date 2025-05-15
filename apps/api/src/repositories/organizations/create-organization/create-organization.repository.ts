import { prisma } from "@/infra/prisma/prisma-connection";

type CreateOrganizationRepository = {
  userId: string;
  name: string;
  domain?: string | null;
  slug: string;
  shouldAttachUsersByDomain: boolean;
};

export async function createOrganizationRepository({
  userId,
  name,
  domain,
  slug,
  shouldAttachUsersByDomain,
}: CreateOrganizationRepository) {
  try {
    const organization = await prisma.organization.create({
      data: {
        name,
        domain,
        slug,
        shouldAttachUsersByDomain,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });

    return organization;
  } catch (error) {
    throw new Error("Failed to create organization");
  }
}
