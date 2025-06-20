import { getInviteByIdRepository } from "@/repositories/invites/get-invite";
import { updateInviteStatusRepository } from "@/repositories/invites/update-invite-status";
import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserByIdService } from "@/services/users/get-user-by-id";
import { rejectInviteService } from "./reject-invite.service";

jest.mock("@/repositories/invites/get-invite");
jest.mock("@/repositories/invites/update-invite-status");
jest.mock("@/services/users/get-user-by-id");

describe("rejectInviteService", () => {
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

  const mockUpdatedInvite = {
    ...mockInvite,
    status: "REJECTED" as const,
  };

  const defaultInput = {
    inviteId: "invite-123",
    userId: "user-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject invite successfully", async () => {
    // Arrange
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      mockUpdatedInvite
    );

    // Act
    const result = await rejectInviteService(defaultInput);

    // Assert
    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "REJECTED",
    });
    expect(result).toEqual(mockUpdatedInvite);
  });

  it("should throw NotFoundError when invite does not exist", async () => {
    // Arrange
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      NotFoundError
    );
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "Invite not found"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when invite is not PENDING", async () => {
    // Arrange
    const acceptedInvite = {
      ...mockInvite,
      status: "ACCEPTED" as const,
    };
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(acceptedInvite);

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "Invite is no longer valid"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when invite is REJECTED", async () => {
    // Arrange
    const rejectedInvite = {
      ...mockInvite,
      status: "REJECTED" as const,
    };
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(rejectedInvite);

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "Invite is no longer valid"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError when email doesn't match", async () => {
    // Arrange
    const userWithDifferentEmail = {
      ...mockUser,
      email: "different@example.com",
    };
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(userWithDifferentEmail);

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      BadRequestError
    );
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "You can only reject invites sent to your email address"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should handle different invite and user IDs", async () => {
    // Arrange
    const differentInput = {
      inviteId: "invite-456",
      userId: "user-456",
    };
    const differentInvite = {
      ...mockInvite,
      id: "invite-456",
      email: "jane@example.com",
    };
    const differentUser = {
      ...mockUser,
      id: "user-456",
      email: "jane@example.com",
    };
    const differentUpdatedInvite = {
      ...differentInvite,
      status: "REJECTED" as const,
    };

    (getInviteByIdRepository as jest.Mock).mockResolvedValue(differentInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(differentUser);
    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      differentUpdatedInvite
    );

    // Act
    const result = await rejectInviteService(differentInput);

    // Assert
    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-456");
    expect(getUserByIdService).toHaveBeenCalledWith("user-456");
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-456",
      status: "REJECTED",
    });
    expect(result).toEqual(differentUpdatedInvite);
  });

  it("should handle invite with ADMIN role", async () => {
    // Arrange
    const adminInvite = {
      ...mockInvite,
      role: "ADMIN" as const,
    };
    const adminUpdatedInvite = {
      ...adminInvite,
      status: "REJECTED" as const,
    };

    (getInviteByIdRepository as jest.Mock).mockResolvedValue(adminInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      adminUpdatedInvite
    );

    // Act
    const result = await rejectInviteService(defaultInput);

    // Assert
    expect(result.role).toBe("ADMIN");
    expect(result.status).toBe("REJECTED");
  });

  it("should handle invite with BILLING role", async () => {
    // Arrange
    const billingInvite = {
      ...mockInvite,
      role: "BILLING" as const,
    };
    const billingUpdatedInvite = {
      ...billingInvite,
      status: "REJECTED" as const,
    };

    (getInviteByIdRepository as jest.Mock).mockResolvedValue(billingInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      billingUpdatedInvite
    );

    // Act
    const result = await rejectInviteService(defaultInput);

    // Assert
    expect(result.role).toBe("BILLING");
    expect(result.status).toBe("REJECTED");
  });

  it("should handle getInviteByIdRepository errors", async () => {
    // Arrange
    (getInviteByIdRepository as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "Database connection failed"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).not.toHaveBeenCalled();
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should handle getUserByIdService errors", async () => {
    // Arrange
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockRejectedValue(
      new Error("User not found")
    );

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "User not found"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(updateInviteStatusRepository).not.toHaveBeenCalled();
  });

  it("should handle updateInviteStatusRepository errors", async () => {
    // Arrange
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(mockUser);
    (updateInviteStatusRepository as jest.Mock).mockRejectedValue(
      new Error("Failed to update invite status")
    );

    // Act & Assert
    await expect(rejectInviteService(defaultInput)).rejects.toThrow(
      "Failed to update invite status"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith("invite-123");
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "REJECTED",
    });
  });

  it("should handle user with null avatarUrl", async () => {
    // Arrange
    const userWithoutAvatar = {
      ...mockUser,
      avatarUrl: null,
    };
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);
    (getUserByIdService as jest.Mock).mockResolvedValue(userWithoutAvatar);
    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      mockUpdatedInvite
    );

    // Act
    const result = await rejectInviteService(defaultInput);

    // Assert
    expect(getUserByIdService).toHaveBeenCalledWith("user-123");
    expect(result).toEqual(mockUpdatedInvite);
  });
});
