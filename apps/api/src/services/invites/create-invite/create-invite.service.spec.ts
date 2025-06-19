import { prisma } from "@/infra/prisma/prisma-connection";
import { createInviteRepository } from "@/repositories/invites/create-invite/create-invite.repository";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { createInviteService } from "./create-invite.service";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    invite: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@/repositories/invites/create-invite/create-invite.repository");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("createInviteService", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Test Organization",
    slug: "test-org",
    domain: "test.com",
    shouldAttachUsersByDomain: false,
    ownerId: "owner-1",
  };

  const mockMembership = {
    id: "membership-1",
    role: "ADMIN" as const,
    userId: "user-1",
    organizationId: "org-1",
  };

  const mockInvite = {
    id: "invite-1",
    email: "test@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-1",
    inviterId: "user-1",
  };

  const defaultInput = {
    email: "test@example.com",
    role: "MEMBER" as const,
    organizationSlug: "test-org",
    userId: "user-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create invite successfully", async () => {
    // Arrange
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.invite.findFirst as jest.Mock).mockResolvedValue(null);
    (createInviteRepository as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await createInviteService(defaultInput);

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-1", "ADMIN");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      include: {
        memberships: {
          where: {
            organizationId: "org-1",
          },
        },
      },
    });
    expect(prisma.invite.findFirst).toHaveBeenCalledWith({
      where: {
        email: "test@example.com",
        organizationId: "org-1",
        status: "PENDING",
      },
    });
    expect(createInviteRepository).toHaveBeenCalledWith({
      email: "test@example.com",
      role: "MEMBER",
      organizationId: "org-1",
      inviterId: "user-1",
    });
    expect(result).toEqual(mockInvite);
  });

  it("should throw ForbiddenError if user cannot create invites", async () => {
    // Arrange
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(true),
    });

    // Act & Assert
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      ForbiddenError
    );
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      "User does not have permission to create invites"
    );

    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-1", "ADMIN");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError if domain auto-attach is enabled", async () => {
    // Arrange
    const orgWithDomainAttach = {
      ...mockOrganization,
      shouldAttachUsersByDomain: true,
    };

    const inputWithSameDomain = {
      ...defaultInput,
      email: "test@test.com", // Same domain as organization
    };

    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: orgWithDomainAttach,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    // Act & Assert
    await expect(createInviteService(inputWithSameDomain)).rejects.toThrow(
      BadRequestError
    );
    await expect(createInviteService(inputWithSameDomain)).rejects.toThrow(
      "Users with domain test.com will be added automatically to the organization on login"
    );

    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
    });
    expect(getUserPermissions).toHaveBeenCalledWith("user-1", "ADMIN");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should throw ConflictError if user is already a member", async () => {
    // Arrange
    const existingUserWithMembership = {
      id: "user-2",
      email: "test@example.com",
      memberships: [
        {
          id: "membership-2",
          organizationId: "org-1",
        },
      ],
    };

    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(
      existingUserWithMembership
    );

    // Act & Assert
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      ConflictError
    );
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      "User is already a member of this organization"
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      include: {
        memberships: {
          where: {
            organizationId: "org-1",
          },
        },
      },
    });
    expect(prisma.invite.findFirst).not.toHaveBeenCalled();
  });

  it("should throw ConflictError if user already has a pending invite", async () => {
    // Arrange
    const existingPendingInvite = {
      id: "existing-invite-1",
      email: "test@example.com",
      status: "PENDING",
    };

    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.invite.findFirst as jest.Mock).mockResolvedValue(
      existingPendingInvite
    );

    // Act & Assert
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      ConflictError
    );
    await expect(createInviteService(defaultInput)).rejects.toThrow(
      "User already has a pending invite"
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      include: {
        memberships: {
          where: {
            organizationId: "org-1",
          },
        },
      },
    });
    expect(prisma.invite.findFirst).toHaveBeenCalledWith({
      where: {
        email: "test@example.com",
        organizationId: "org-1",
        status: "PENDING",
      },
    });
    expect(createInviteRepository).not.toHaveBeenCalled();
  });

  it("should create invite for existing user without membership", async () => {
    // Arrange
    const existingUserWithoutMembership = {
      id: "user-2",
      email: "test@example.com",
      memberships: [], // No memberships in this organization
    };

    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(
      existingUserWithoutMembership
    );
    (prisma.invite.findFirst as jest.Mock).mockResolvedValue(null);
    (createInviteRepository as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await createInviteService(defaultInput);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      include: {
        memberships: {
          where: {
            organizationId: "org-1",
          },
        },
      },
    });
    expect(prisma.invite.findFirst).toHaveBeenCalledWith({
      where: {
        email: "test@example.com",
        organizationId: "org-1",
        status: "PENDING",
      },
    });
    expect(createInviteRepository).toHaveBeenCalledWith({
      email: "test@example.com",
      role: "MEMBER",
      organizationId: "org-1",
      inviterId: "user-1",
    });
    expect(result).toEqual(mockInvite);
  });

  it("should create invite with ADMIN role", async () => {
    // Arrange
    const adminInput = {
      ...defaultInput,
      role: "ADMIN" as const,
    };

    const adminInvite = {
      ...mockInvite,
      role: "ADMIN" as const,
    };

    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      membership: mockMembership,
      organization: mockOrganization,
    });

    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.invite.findFirst as jest.Mock).mockResolvedValue(null);
    (createInviteRepository as jest.Mock).mockResolvedValue(adminInvite);

    // Act
    const result = await createInviteService(adminInput);

    // Assert
    expect(createInviteRepository).toHaveBeenCalledWith({
      email: "test@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      inviterId: "user-1",
    });
    expect(result).toEqual(adminInvite);
  });
});
