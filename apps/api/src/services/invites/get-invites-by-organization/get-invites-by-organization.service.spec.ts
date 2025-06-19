import { getInvitesByOrganizationRepository } from "@/repositories/invites/get-invites-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { getInvitesByOrganizationService } from "./get-invites-by-organization.service";

// Mock all dependencies
jest.mock(
  "@/repositories/invites/get-invites-by-organization/get-invites-by-organization.repository"
);
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

const mockGetInvitesByOrganizationRepository =
  getInvitesByOrganizationRepository as jest.MockedFunction<
    typeof getInvitesByOrganizationRepository
  >;
const mockGetUserPermissions = getUserPermissions as jest.MockedFunction<
  typeof getUserPermissions
>;
const mockGetUserMembershipOrganizationService =
  getUserMembershipOrganizationService as jest.MockedFunction<
    typeof getUserMembershipOrganizationService
  >;

describe("getInvitesByOrganizationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockParams = {
    organizationSlug: "test-org",
    userId: "user-123",
  };

  const mockMembership = {
    id: "membership-123",
    role: "ADMIN" as const,
    userId: "user-123",
    organizationId: "org-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganization = {
    id: "org-123",
    name: "Test Organization",
    slug: "test-org",
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: null,
    ownerId: "user-123",
    domain: null,
    shouldAttachUsersByDomain: false,
  };

  const mockInvites = [
    {
      id: "invite-1",
      email: "user1@example.com",
      role: "MEMBER" as const,
      status: "PENDING" as const,
      organizationId: "org-123",
      inviterId: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      inviter: {
        id: "user-123",
        email: "inviter@example.com",
        name: "Inviter User",
        avatarUrl: null,
      },
    },
    {
      id: "invite-2",
      email: "user2@example.com",
      role: "ADMIN" as const,
      status: "PENDING" as const,
      organizationId: "org-123",
      inviterId: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      inviter: {
        id: "user-123",
        email: "inviter@example.com",
        name: "Inviter User",
        avatarUrl: null,
      },
    },
  ];

  it("should return invites when user has permission", async () => {
    // Arrange
    mockGetUserMembershipOrganizationService.mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    mockGetUserPermissions.mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
      can: jest.fn().mockReturnValue(true),
    });

    mockGetInvitesByOrganizationRepository.mockResolvedValue(mockInvites);

    // Act
    const result = await getInvitesByOrganizationService(mockParams);

    // Assert
    expect(result).toEqual(mockInvites);
    expect(mockGetUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: mockParams.userId,
      organizationSlug: mockParams.organizationSlug,
    });
    expect(mockGetUserPermissions).toHaveBeenCalledWith(
      mockParams.userId,
      mockMembership.role
    );
    expect(mockGetInvitesByOrganizationRepository).toHaveBeenCalledWith(
      mockOrganization.id
    );
  });

  it("should throw ForbiddenError when user cannot get invites", async () => {
    // Arrange
    mockGetUserMembershipOrganizationService.mockResolvedValue({
      membership: { ...mockMembership, role: "MEMBER" as const },
      organization: mockOrganization,
    });

    mockGetUserPermissions.mockReturnValue({
      cannot: jest.fn().mockReturnValue(true),
      can: jest.fn().mockReturnValue(false),
    });

    // Act & Assert
    await expect(getInvitesByOrganizationService(mockParams)).rejects.toThrow(
      new ForbiddenError("User does not have permission to view invites")
    );

    expect(mockGetUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: mockParams.userId,
      organizationSlug: mockParams.organizationSlug,
    });
    expect(mockGetUserPermissions).toHaveBeenCalledWith(
      mockParams.userId,
      "MEMBER"
    );
    expect(mockGetInvitesByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw error when getUserMembershipOrganizationService fails", async () => {
    // Arrange
    const mockError = new Error("Membership service failed");
    mockGetUserMembershipOrganizationService.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getInvitesByOrganizationService(mockParams)).rejects.toThrow(
      mockError
    );

    expect(mockGetUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: mockParams.userId,
      organizationSlug: mockParams.organizationSlug,
    });
    expect(mockGetUserPermissions).not.toHaveBeenCalled();
    expect(mockGetInvitesByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw error when repository fails", async () => {
    // Arrange
    mockGetUserMembershipOrganizationService.mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    mockGetUserPermissions.mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
      can: jest.fn().mockReturnValue(true),
    });

    const mockError = new Error("Repository failed");
    mockGetInvitesByOrganizationRepository.mockRejectedValue(mockError);

    // Act & Assert
    await expect(getInvitesByOrganizationService(mockParams)).rejects.toThrow(
      mockError
    );

    expect(mockGetUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: mockParams.userId,
      organizationSlug: mockParams.organizationSlug,
    });
    expect(mockGetUserPermissions).toHaveBeenCalledWith(
      mockParams.userId,
      mockMembership.role
    );
    expect(mockGetInvitesByOrganizationRepository).toHaveBeenCalledWith(
      mockOrganization.id
    );
  });

  it("should handle empty invites array", async () => {
    // Arrange
    mockGetUserMembershipOrganizationService.mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    mockGetUserPermissions.mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
      can: jest.fn().mockReturnValue(true),
    });

    mockGetInvitesByOrganizationRepository.mockResolvedValue([]);

    // Act
    const result = await getInvitesByOrganizationService(mockParams);

    // Assert
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
