import { Role } from "@/generated/prisma";
import { findDuplicateOrganizationDomainRepository } from "@/repositories/organizations/find-duplicate-organization-domain";
import { updateOrganizationRepository } from "@/repositories/organizations/update-organization";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { updateOrganizationService } from "./update-organization.service";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/organizations/find-duplicate-organization-domain");
jest.mock("@/repositories/organizations/update-organization");

const baseOrg = {
  id: "org-1",
  name: "Org Name",
  slug: "org-slug",
  domain: "org.com",
  avatarUrl: null,
  shouldAttachUsersByDomain: false,
  ownerId: "owner-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};
const baseMembership = {
  id: "mem-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  role: Role.ADMIN,
  userId: "user-1",
  organizationId: baseOrg.id,
};

describe("updateOrganizationService", () => {
  const userId = "user-1";
  const slug = baseOrg.slug;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getUserMembershipOrganizationService).mockResolvedValue({
      organization: baseOrg,
      membership: baseMembership,
    });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: jest.fn().mockReturnValue(true),
      cannot: jest.fn().mockReturnValue(false),
    });
    jest
      .mocked(findDuplicateOrganizationDomainRepository)
      .mockResolvedValue(null);
    jest.mocked(updateOrganizationRepository).mockResolvedValue({ ...baseOrg });
  });

  it("should update organization successfully", async () => {
    const updated = { ...baseOrg, name: "New Name" };
    jest.mocked(updateOrganizationRepository).mockResolvedValueOnce(updated);
    const result = await updateOrganizationService({
      slug,
      name: "New Name",
      userId,
    });
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug: slug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(
      userId,
      baseMembership.role
    );
    expect(updateOrganizationRepository).toHaveBeenCalledWith({
      organizationId: baseOrg.id,
      name: "New Name",
      domain: undefined,
      shouldAttachUsersByDomain: undefined,
    });
    expect(result).toEqual(updated);
  });

  it("should throw ForbiddenError if user cannot update organization", async () => {
    jest.mocked(getUserPermissions).mockReturnValue({
      can: jest.fn().mockReturnValue(false),
      cannot: jest.fn().mockReturnValue(true),
    });
    await expect(
      updateOrganizationService({ slug, name: "New Name", userId })
    ).rejects.toThrow(ForbiddenError);
  });

  it("should throw ConflictError if duplicate organization domain exists", async () => {
    jest
      .mocked(findDuplicateOrganizationDomainRepository)
      .mockResolvedValueOnce({ ...baseOrg, id: "org-2", slug: "other-slug" });
    await expect(
      updateOrganizationService({ slug, domain: "org.com", userId })
    ).rejects.toThrow(ConflictError);
  });

  it("should call updateOrganizationRepository with all fields", async () => {
    await updateOrganizationService({
      slug,
      name: "Name",
      domain: "new.com",
      shouldAttachUsersByDomain: true,
      userId,
    });
    expect(updateOrganizationRepository).toHaveBeenCalledWith({
      organizationId: baseOrg.id,
      name: "Name",
      domain: "new.com",
      shouldAttachUsersByDomain: true,
    });
  });
});
