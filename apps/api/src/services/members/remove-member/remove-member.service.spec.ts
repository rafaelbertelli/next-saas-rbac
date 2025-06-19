import { Role } from "@/generated/prisma";
import { getMemberByIdRepository } from "@/repositories/members/get-member-by-id/get-member-by-id.repository";
import { removeMembershipRepository } from "@/repositories/members/remove-membership/remove-membership.repository";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { removeMemberService } from "./remove-member.service";

jest.mock(
  "@/repositories/members/get-member-by-id/get-member-by-id.repository"
);
jest.mock(
  "@/repositories/members/remove-membership/remove-membership.repository"
);
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("removeMemberService", () => {
  const userId = "user-1";
  const organizationSlug = "org-slug";
  const memberId = "member-1";
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
  const memberToRemove = {
    id: memberId,
    userId: "user-to-remove",
    role: Role.MEMBER,
    organizationId: organization.id,
  };
  const mockRemovedMember = {
    id: memberId,
    userId: "user-to-remove",
    role: Role.MEMBER,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should remove member when user has permission", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getMemberByIdRepository).mockResolvedValueOnce(memberToRemove);
    jest
      .mocked(removeMembershipRepository)
      .mockResolvedValueOnce(mockRemovedMember);

    // Act
    const result = await removeMemberService({
      userId,
      organizationSlug,
      memberId,
    });

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getMemberByIdRepository).toHaveBeenCalledWith({
      memberId,
      organizationId: organization.id,
    });
    expect(removeMembershipRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
      memberId,
    });
    expect(result).toEqual(mockRemovedMember);
  });

  it("should throw ForbiddenError if user cannot remove members", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow(
      new ForbiddenError("User does not have permission to remove member")
    );
    expect(getMemberByIdRepository).not.toHaveBeenCalled();
    expect(removeMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if member to remove does not exist", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getMemberByIdRepository).mockResolvedValueOnce(null);

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow(new NotFoundError("Member not found"));
    expect(removeMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganizationService throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getMemberByIdRepository).not.toHaveBeenCalled();
    expect(removeMembershipRepository).not.toHaveBeenCalled();
  });

  it("should throw if removeMembershipRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getMemberByIdRepository).mockResolvedValueOnce(memberToRemove);
    jest
      .mocked(removeMembershipRepository)
      .mockRejectedValueOnce(new Error("Failed to remove membership"));

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow("Failed to remove membership");
  });

  it("should work when MEMBER user tries but fails permission check", async () => {
    // Arrange
    const memberMembership = {
      ...membership,
      role: Role.MEMBER,
    };
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership: memberMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow(
      new ForbiddenError("User does not have permission to remove member")
    );
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.MEMBER);
    expect(getMemberByIdRepository).not.toHaveBeenCalled();
    expect(removeMembershipRepository).not.toHaveBeenCalled();
  });

  it("should work with different member roles to remove", async () => {
    // Arrange
    const adminMemberToRemove = {
      ...memberToRemove,
      role: Role.ADMIN,
    };
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMemberByIdRepository)
      .mockResolvedValueOnce(adminMemberToRemove);
    const removedAdminMember = {
      ...mockRemovedMember,
      role: Role.ADMIN,
    };
    jest
      .mocked(removeMembershipRepository)
      .mockResolvedValueOnce(removedAdminMember);

    // Act
    const result = await removeMemberService({
      userId,
      organizationSlug,
      memberId,
    });

    // Assert
    expect(result.role).toBe(Role.ADMIN);
    expect(result).toEqual(removedAdminMember);
  });

  it("should handle getMemberByIdRepository error", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMemberByIdRepository)
      .mockRejectedValueOnce(new Error("Failed to get member by id"));

    // Act & Assert
    await expect(
      removeMemberService({ userId, organizationSlug, memberId })
    ).rejects.toThrow("Failed to get member by id");
    expect(removeMembershipRepository).not.toHaveBeenCalled();
  });
});
