import { prisma } from "@/infra/prisma/prisma-connection";

type GetMembershipBySlugRepository = {
  userId: string;
  organizationSlug: string;
};

export async function getMembershipBySlugRepository({
  userId,
  organizationSlug,
}: GetMembershipBySlugRepository) {
  try {
    const member = await prisma.member.findFirst({
      where: {
        userId,
        organization: {
          slug: organizationSlug,
        },
      },
      include: {
        organization: true,
      },
    });

    return member;
  } catch (error) {
    throw new Error("Failed to get membership by slug");
  }
}
