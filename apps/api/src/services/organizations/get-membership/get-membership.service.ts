import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { FastifyRequest } from "fastify";
import { getCurrentUserId } from "../../users/get-current-user-id";

export async function getMembership(
  request: FastifyRequest,
  organizationSlug: string
) {
  const userId = await getCurrentUserId(request);

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
