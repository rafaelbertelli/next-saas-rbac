import { Role } from "@/generated/prisma";
import { updateMembershipRepository } from "@/repositories/members/update-membership/update-membership.repository";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { updateMemberService } from "./update-member.service";

jest.mock(
  "@/repositories/members/update-membership/update-membership.repository"
);
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("updateMemberService", () => {
  const userId = "user-1";
  const organizationSlug = "org-slug";
  const memberId = "member-1";
  const newRole = Role.ADMIN;
  const organization = {
    id: "org-1",
    name: "Org Name",
    slug: organizationSlug,
    domain: null,
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };
  const membership = {
    id: "membership-1",
    role: Role.ADMIN,
    userId: userId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };
  const mockUpdatedMember = {
    id: memberId,
    role: newRole,
    userId: memberId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update member role when user has permission", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(updateMembershipRepository)
      .mockResolvedValueOnce(mockUpdatedMember);

    // Act
    const result = await updateMemberService({
      userId,
      organizationSlug,
      memberId,
      role: newRole,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(updateMembershipRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
      memberId,
      role: newRole,
    });
    expect(result).toEqual(mockUpdatedMember);
  });

  it("should throw ForbiddenError if user cannot update members", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      updateMemberService({ userId, organizationSlug, memberId, role: newRole })
    ).rejects.toThrow(
      new ForbiddenError("User does not have permission to update member")
    );
    expect(updateMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw ForbiddenError if trying to update organization owner", async () => {
    // Arrange
    const ownerMemberId = organization.ownerId;
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });

    // Act & Assert
    await expect(
      updateMemberService({
        userId,
        organizationSlug,
        memberId: ownerMemberId,
        role: newRole,
      })
    ).rejects.toThrow(
      new ForbiddenError("Cannot update organization owner role")
    );
    expect(updateMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganization throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      updateMemberService({ userId, organizationSlug, memberId, role: newRole })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(updateMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw if updateMembershipRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(updateMembershipRepository)
      .mockRejectedValueOnce(new Error("Failed to update membership"));

    // Act & Assert
    await expect(
      updateMemberService({ userId, organizationSlug, memberId, role: newRole })
    ).rejects.toThrow("Failed to update membership");
  });

  it("should work with different roles", async () => {
    // Arrange
    const targetRole = Role.BILLING;
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    const updatedMemberWithBillingRole = {
      ...mockUpdatedMember,
      role: targetRole,
    };
    jest
      .mocked(updateMembershipRepository)
      .mockResolvedValueOnce(updatedMemberWithBillingRole);

    // Act
    const result = await updateMemberService({
      userId,
      organizationSlug,
      memberId,
      role: targetRole,
    });

    // Assert
    expect(updateMembershipRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
      memberId,
      role: targetRole,
    });
    expect(result.role).toBe(targetRole);
  });

  it("should work when MEMBER user tries but fails permission check", async () => {
    // Arrange
    const memberMembership = {
      ...membership,
      role: Role.MEMBER,
    };
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership: memberMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      updateMemberService({ userId, organizationSlug, memberId, role: newRole })
    ).rejects.toThrow(
      new ForbiddenError("User does not have permission to update member")
    );
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.MEMBER);
    expect(updateMembershipRepository).not.toHaveBeenCalled();
  });
});
