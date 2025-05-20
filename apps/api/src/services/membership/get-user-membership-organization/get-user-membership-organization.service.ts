import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

type GetUserMembershipOrganization = {
  userId: string;
  organizationSlug: string;
};

export async function getUserMembershipOrganization({
  userId,
  organizationSlug,
}: GetUserMembershipOrganization) {
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
