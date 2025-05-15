import { getOrganizationByDomainRepository } from "@/repositories/organizations/get-organization-by-domain";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";

export async function checkDuplicateOrganizationService(domain: string) {
  const organization = await getOrganizationByDomainRepository(domain);

  if (organization) {
    throw new ConflictError("Organization already exists");
  }

  return organization;
}
