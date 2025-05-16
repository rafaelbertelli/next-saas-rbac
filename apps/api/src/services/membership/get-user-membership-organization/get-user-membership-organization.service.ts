import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

export async function getUserMembershipOrganization(
  userId: string,
  organizationSlug: string
) {
  const member = await getMembershipBySlugRepository({
    userId,
    organizationSlug,
  });

  if (!member) {
    throw new NotFoundError("You are not a member of this organization");
  }

  const { organization, ...membership } = member;

  return {
    organization,
    membership,
  };
}
