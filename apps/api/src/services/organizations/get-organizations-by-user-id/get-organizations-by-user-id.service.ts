import { getOrganizationsByUserIdRepository } from "@/repositories/organizations/get-organizations-by-user-id";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";

export async function getOrganizationsByUserIdService(userId: string) {
  const organizations = await getOrganizationsByUserIdRepository(userId);

  if (!organizations) {
    throw new NotFoundError("Organizations not found");
  }

  return organizations;
}
