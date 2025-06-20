import { deleteInviteRepository } from "@/repositories/invites/delete-invite";
import { getInviteByOrganizationRepository } from "@/repositories/invites/get-invite-by-organization";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { revokeInviteService } from "./revoke-invite.service";

jest.mock("@/repositories/invites/delete-invite");
jest.mock("@/repositories/invites/get-invite-by-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("revokeInviteService", () => {
  const mockMembership = {
    id: "membership-123",
    role: "ADMIN" as const,
    userId: "user-123",
    organizationId: "org-123",
  };

  const mockOrganization = {
    id: "org-123",
    name: "Test Organization",
    slug: "test-org",
    domain: "test.com",
    shouldAttachUsersByDomain: false,
    avatarUrl: null,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
  };

  const mockUserMembershipOrganization = {
    membership: mockMembership,
    organization: mockOrganization,
  };

  const mockInvite = {
    id: "invite-123",
    email: "john@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-123",
    inviterId: "inviter-123",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
  };

  const mockPermissions = {
    can: jest.fn(),
    cannot: jest.fn().mockReturnValue(false),
  };

  const defaultInput = {
    inviteId: "invite-123",
    organizationSlug: "test-org",
    userId: "user-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should revoke invite successfully", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      mockInvite
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(defaultInput);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(mockPermissions.cannot).toHaveBeenCalledWith("delete", "Invite");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });

  it("should throw ForbiddenError when user lacks permission to delete invites", async () => {
    // Arrange
    const noPermissionsMock = {
      can: jest.fn(),
      cannot: jest.fn().mockReturnValue(true), // User cannot delete invites
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(noPermissionsMock);

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      ForbiddenError
    );
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "User does not have permission to revoke invites"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(noPermissionsMock.cannot).toHaveBeenCalledWith("delete", "Invite");
    expect(getInviteByOrganizationRepository).not.toHaveBeenCalled();
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when invite is not found", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      NotFoundError
    );
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Invite not found"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when invite is not PENDING", async () => {
    // Arrange
    const acceptedInvite = {
      ...mockInvite,
      status: "ACCEPTED" as const,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      acceptedInvite
    );

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Only pending invites can be revoked"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when invite is REJECTED", async () => {
    // Arrange
    const rejectedInvite = {
      ...mockInvite,
      status: "REJECTED" as const,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      rejectedInvite
    );

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Only pending invites can be revoked"
    );

    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should handle different user roles with permission", async () => {
    // Arrange
    const billingMembership = {
      ...mockMembership,
      role: "BILLING" as const,
    };
    const billingUserMembershipOrganization = {
      membership: billingMembership,
      organization: mockOrganization,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      billingUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      mockInvite
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(defaultInput);

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "BILLING");
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });

  it("should handle different organization and invite IDs", async () => {
    // Arrange
    const differentInput = {
      inviteId: "invite-456",
      organizationSlug: "different-org",
      userId: "user-456",
    };

    const differentOrganization = {
      ...mockOrganization,
      id: "org-456",
      slug: "different-org",
    };

    const differentUserMembershipOrganization = {
      membership: {
        ...mockMembership,
        userId: "user-456",
        organizationId: "org-456",
      },
      organization: differentOrganization,
    };

    const differentInvite = {
      ...mockInvite,
      id: "invite-456",
      organizationId: "org-456",
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      differentUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      differentInvite
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(differentInput);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-456",
      organizationSlug: "different-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-456", "ADMIN");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-456",
      "invite-456"
    );
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-456");
  });

  it("should handle getUserMembershipOrganizationService errors", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockRejectedValue(
      new Error("Organization not found")
    );

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Organization not found"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getInviteByOrganizationRepository).not.toHaveBeenCalled();
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should handle getInviteByOrganizationRepository errors", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Database connection failed"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).not.toHaveBeenCalled();
  });

  it("should handle deleteInviteRepository errors", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      mockInvite
    );
    (deleteInviteRepository as jest.Mock).mockRejectedValue(
      new Error("Failed to delete invite")
    );

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "ADMIN");
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });

  it("should handle MEMBER role without permission", async () => {
    // Arrange
    const memberMembership = {
      ...mockMembership,
      role: "MEMBER" as const,
    };
    const memberUserMembershipOrganization = {
      membership: memberMembership,
      organization: mockOrganization,
    };

    const memberPermissions = {
      can: jest.fn(),
      cannot: jest.fn().mockReturnValue(true), // Member cannot delete invites
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      memberUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(memberPermissions);

    // Act & Assert
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      ForbiddenError
    );
    await expect(revokeInviteService(defaultInput)).rejects.toThrow(
      "User does not have permission to revoke invites"
    );

    expect(getUserPermissions).toHaveBeenCalledWith("user-123", "MEMBER");
    expect(memberPermissions.cannot).toHaveBeenCalledWith("delete", "Invite");
    expect(getInviteByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should handle invite with different roles", async () => {
    // Arrange
    const adminInvite = {
      ...mockInvite,
      role: "ADMIN" as const,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      adminInvite
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(defaultInput);

    // Assert
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });

  it("should handle invite with null inviterId", async () => {
    // Arrange
    const inviteWithoutInviter = {
      ...mockInvite,
      inviterId: null,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      mockUserMembershipOrganization
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      inviteWithoutInviter
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(defaultInput);

    // Assert
    expect(getInviteByOrganizationRepository).toHaveBeenCalledWith(
      "org-123",
      "invite-123"
    );
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });

  it("should handle organization with null avatarUrl", async () => {
    // Arrange
    const orgWithoutAvatar = {
      ...mockOrganization,
      avatarUrl: null,
    };
    const userMembershipWithoutAvatar = {
      membership: mockMembership,
      organization: orgWithoutAvatar,
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue(
      userMembershipWithoutAvatar
    );
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (getInviteByOrganizationRepository as jest.Mock).mockResolvedValue(
      mockInvite
    );
    (deleteInviteRepository as jest.Mock).mockResolvedValue(undefined);

    // Act
    await revokeInviteService(defaultInput);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(deleteInviteRepository).toHaveBeenCalledWith("invite-123");
  });
});
