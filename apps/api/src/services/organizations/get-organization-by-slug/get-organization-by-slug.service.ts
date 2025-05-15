import { getOrganizationBySlugRepository } from "@/repositories/organizations/get-organization-by-slug/get-organization-by-slug";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
export async function getOrganizationBySlugService(slug: string) {
  const organization = await getOrganizationBySlugRepository(slug);

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  return organization;
}
