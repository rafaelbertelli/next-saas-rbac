import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { getMembershipBySlugService } from "@/services/members/get-membership-by-slug.service";
import { FastifyRequest } from "fastify";
import { getCurrentUserId } from "./get-current-user-id";

export async function getUserMembership(
  request: FastifyRequest,
  organizationSlug: string
) {
  const userId = await getCurrentUserId(request);
  const member = await getMembershipBySlugService({ userId, organizationSlug });

  if (!member) {
    throw new UnauthorizedError("You are not a member of this organization");
  }

  const { organization, ...membership } = member;

  return {
    organization,
    membership,
  };
}
