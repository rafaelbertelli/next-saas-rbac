import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

type GetMembershipBySlugService = {
  userId: string;
  organizationSlug: string;
};

export async function getMembershipBySlugService({
  userId,
  organizationSlug,
}: GetMembershipBySlugService) {
  const member = await getMembershipBySlugRepository({
    userId,
    organizationSlug,
  });

  if (!member) {
    throw new NotFoundError("You are not a member of this organization");
  }

  return member;
}
