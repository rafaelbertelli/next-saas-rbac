import { createOrganizationRepository } from "@/repositories/organizations/create-organization.repository";
import { createSlug } from "@/utils/slug/create-slug";

type CreateOrganization = {
  userId: string;
  name: string;
  domain?: string | null;
  shouldAttachUsersByDomain?: boolean;
};

export async function createOrganizationService({
  userId,
  name,
  domain,
  shouldAttachUsersByDomain = false,
}: CreateOrganization) {
  const slug = createSlug(name);

  const organization = await createOrganizationRepository({
    userId,
    name,
    domain,
    slug,
    shouldAttachUsersByDomain,
  });

  return organization;
}
