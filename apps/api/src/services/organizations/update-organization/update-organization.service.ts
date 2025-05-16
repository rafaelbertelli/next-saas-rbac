import { findDuplicateOrganizationDomainRepository } from "@/repositories/organizations/find-duplicate-organization-domain";
import { updateOrganizationRepository } from "@/repositories/organizations/update-organization";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { organizationSchema } from "@repo/auth";

type UpdateOrganization = {
  slug: string;
  name?: string;
  domain?: string | null;
  shouldAttachUsersByDomain?: boolean;
  userId: string;
};

export async function updateOrganizationService({
  slug,
  name,
  domain,
  shouldAttachUsersByDomain,
  userId,
}: UpdateOrganization) {
  const { membership, organization } = await getUserMembershipOrganization({
    userId,
    organizationSlug: slug,
  });

  // check user permission
  const { cannot } = getUserPermissions(userId, membership.role);
  const authOrganization = organizationSchema.parse({
    id: organization.id,
    ownerId: organization.ownerId,
  });

  if (cannot("update", authOrganization)) {
    throw new ForbiddenError(
      "User does not have permission to update organization"
    );
  }
  // end

  if (domain) {
    const duplicateOrganization =
      await findDuplicateOrganizationDomainRepository(
        domain,
        organization.slug
      );

    if (duplicateOrganization) {
      throw new ConflictError("Organization already exists");
    }
  }

  const updatedOrganization = await updateOrganizationRepository({
    organizationId: organization.id,
    name,
    domain,
    shouldAttachUsersByDomain,
  });

  return updatedOrganization;
}
