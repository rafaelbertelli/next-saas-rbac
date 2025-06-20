import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { addMemberService } from "@/services/members/add-member";
import { getUserByIdService } from "@/services/users/get-user-by-id";
import { acceptInviteService } from ".";
import { getInviteService } from "../get-invite";
import { updateInviteStatusService } from "../update-invite-status";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock("../get-invite");
jest.mock("@/services/users/get-user-by-id");
jest.mock("@/repositories/members/get-membership-by-slug");
jest.mock("@/services/members/add-member");
jest.mock("../update-invite-status");

describe("acceptInviteService", () => {
  const mockInvite = {
    id: "invite-123",
    email: "john@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-123",
    inviterId: "inviter-123",
    organization: {
      id: "org-123",
      name: "Test Organization",
      slug: "test-org",
    },
  };

  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const defaultInput = {
    userId: "user-123",
    inviteId: "invite-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should accept invite successfully", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback({}); // Mock transaction
    });
    (addMemberService as jest.Mock).mockResolvedValue(undefined);
    (updateInviteStatusService as jest.Mock).mockResolvedValue(undefined);

    // Act
    const result = await acceptInviteService(defaultInput);

    // Assert
    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(getMembershipBySlugRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(addMemberService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
      tx: {},
    });
    expect(updateInviteStatusService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
      tx: {},
    });
    expect(result).toBeUndefined();
  });

  it("should throw BadRequestError when invite is not PENDING", async () => {
    // Arrange
    const expiredInvite = {
      ...mockInvite,
      status: "ACCEPTED" as const,
    };
    (getInviteService as jest.Mock).mockResolvedValue(expiredInvite);

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "Invite is no longer valid"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
    expect(getMembershipBySlugRepository).not.toHaveBeenCalled();
    expect(addMemberService).not.toHaveBeenCalled();
    expect(updateInviteStatusService).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when email doesn't match", async () => {
    // Arrange
    const userWithDifferentEmail = {
      ...mockUser,
      email: "different@example.com",
    };
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(userWithDifferentEmail);

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "You can only accept invites sent to your email address"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(getMembershipBySlugRepository).not.toHaveBeenCalled();
    expect(addMemberService).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when user is already a member", async () => {
    // Arrange
    const existingMembership = {
      id: "membership-123",
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
    };
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(
      existingMembership
    );
    (updateInviteStatusService as jest.Mock).mockResolvedValue(undefined);

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "You are already a member of this organization"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(getMembershipBySlugRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(updateInviteStatusService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
    });
    expect(addMemberService).not.toHaveBeenCalled();
  });

  it("should accept invite with ADMIN role", async () => {
    // Arrange
    const adminInvite = {
      ...mockInvite,
      role: "ADMIN" as const,
    };
    (getInviteService as jest.Mock).mockResolvedValue(adminInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback({});
    });
    (addMemberService as jest.Mock).mockResolvedValue(undefined);
    (updateInviteStatusService as jest.Mock).mockResolvedValue(undefined);

    // Act
    await acceptInviteService(defaultInput);

    // Assert
    expect(addMemberService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "ADMIN",
      tx: {},
    });
  });

  it("should accept invite with BILLING role", async () => {
    // Arrange
    const billingInvite = {
      ...mockInvite,
      role: "BILLING" as const,
    };
    (getInviteService as jest.Mock).mockResolvedValue(billingInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback({});
    });
    (addMemberService as jest.Mock).mockResolvedValue(undefined);
    (updateInviteStatusService as jest.Mock).mockResolvedValue(undefined);

    // Act
    await acceptInviteService(defaultInput);

    // Assert
    expect(addMemberService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "BILLING",
      tx: {},
    });
  });

  it("should handle transaction errors", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Error("Transaction failed")
    );

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "Transaction failed"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(getMembershipBySlugRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
  });

  it("should handle getInviteService errors", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockRejectedValue(
      new Error("Invite not found")
    );

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "Invite not found"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
  });

  it("should handle getUserByIdService errors", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockRejectedValue(
      new Error("User not found")
    );

    // Act & Assert
    await expect(acceptInviteService(defaultInput)).rejects.toThrow(
      "User not found"
    );

    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(getMembershipBySlugRepository).not.toHaveBeenCalled();
  });
});
