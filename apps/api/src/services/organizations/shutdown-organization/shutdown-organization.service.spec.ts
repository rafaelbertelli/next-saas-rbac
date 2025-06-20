import { deleteOrganizationRepository } from "@/repositories/organizations/delete-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { shutdownOrganizationService } from "./";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/organizations/delete-organization");

describe("shutdownOrganizationService", () => {
  const userId = "user-1";
  const slug = "org-slug";
  const organization = {
    id: "org-123",
    ownerId: "owner-1",
    __typename: "Organization",
  };
  const membership = {
    role: "ADMIN",
    userId,
    organizationId: organization.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should shutdown organization when user has permission", async () => {
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });
    const deletedOrg = { ...organization, deleted: true };
    (deleteOrganizationRepository as jest.Mock).mockResolvedValue(deletedOrg);

    const result = await shutdownOrganizationService({ slug, userId });
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug: slug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(deleteOrganizationRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
    });
    expect(result).toEqual(deletedOrg);
  });

  it("should throw ForbiddenError if user cannot delete organization", async () => {
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(true),
    });

    await expect(shutdownOrganizationService({ slug, userId })).rejects.toThrow(
      ForbiddenError
    );
    expect(deleteOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should propagate error from getUserMembershipOrganizationService", async () => {
    const error = new Error("Membership error");
    (getUserMembershipOrganizationService as jest.Mock).mockRejectedValue(
      error
    );

    await expect(shutdownOrganizationService({ slug, userId })).rejects.toThrow(
      error
    );
  });

  it("should propagate error from deleteOrganizationRepository", async () => {
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });
    const error = new Error("Delete error");
    (deleteOrganizationRepository as jest.Mock).mockRejectedValue(error);

    await expect(shutdownOrganizationService({ slug, userId })).rejects.toThrow(
      error
    );
  });
});
