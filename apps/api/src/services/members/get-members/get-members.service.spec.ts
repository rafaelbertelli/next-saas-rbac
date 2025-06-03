import { Role } from "@/generated/prisma";
import { getMembersByOrganizationRepository } from "@/repositories/members/get-members-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { getMembersService } from "./get-members.service";

jest.mock("@/repositories/members/get-members-by-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("getMembersService", () => {
  const userId = "user-1";
  const organizationSlug = "org-slug";
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
  const mockMembers = [
    {
      id: "member-1",
      role: Role.ADMIN,
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar1.png",
      },
    },
    {
      id: "member-2",
      role: Role.MEMBER,
      user: {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: null,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return members when user has permission", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMembersByOrganizationRepository)
      .mockResolvedValueOnce(mockMembers);

    // Act
    const result = await getMembersService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getMembersByOrganizationRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
    });
    expect(result).toEqual(mockMembers);
  });

  it("should return empty array when no members exist", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getMembersByOrganizationRepository).mockResolvedValueOnce([]);

    // Act
    const result = await getMembersService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getMembersByOrganizationRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
    });
    expect(result).toEqual([]);
  });

  it("should throw ForbiddenError if user cannot get members", async () => {
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
      getMembersService({ userId, organizationSlug })
    ).rejects.toThrow(
      new ForbiddenError("User does not have permission to get members")
    );
    expect(getMembersByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganization throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      getMembersService({ userId, organizationSlug })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getMembersByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw if getMembersByOrganizationRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMembersByOrganizationRepository)
      .mockRejectedValueOnce(
        new Error("Failed to get members by organization")
      );

    // Act & Assert
    await expect(
      getMembersService({ userId, organizationSlug })
    ).rejects.toThrow("Failed to get members by organization");
  });

  it("should work with different user roles", async () => {
    // Arrange
    const memberMembership = {
      ...membership,
      role: Role.MEMBER,
    };
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership: memberMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMembersByOrganizationRepository)
      .mockResolvedValueOnce(mockMembers);

    // Act
    const result = await getMembersService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.MEMBER);
    expect(result).toEqual(mockMembers);
  });

  it("should handle BILLING role correctly", async () => {
    // Arrange
    const billingMembership = {
      ...membership,
      role: Role.BILLING,
    };
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership: billingMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getMembersByOrganizationRepository)
      .mockResolvedValueOnce(mockMembers);

    // Act
    const result = await getMembersService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.BILLING);
    expect(result).toEqual(mockMembers);
  });
});
