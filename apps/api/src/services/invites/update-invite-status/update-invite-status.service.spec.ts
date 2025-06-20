import { InviteStatus } from "@/generated/prisma";
import { updateInviteStatusRepository } from "@/repositories/invites/update-invite-status";
import { updateInviteStatusService } from "./update-invite-status.service";

jest.mock("@/repositories/invites/update-invite-status");

describe("updateInviteStatusService", () => {
  const mockInvite = {
    id: "invite-123",
    email: "test@example.com",
    role: "MEMBER" as const,
    status: "ACCEPTED" as InviteStatus,
    organizationId: "org-123",
    inviterId: "inviter-123",
    createdAt: new Date(),
    updatedAt: new Date(),
    organization: {
      id: "org-123",
      name: "Test Organization",
      slug: "test-org",
    },
  };

  const mockTransaction = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update invite status to ACCEPTED and return invite", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
      tx: undefined,
    });
    expect(result).toEqual(mockInvite);
  });

  it("should update invite status to REJECTED and return invite", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "REJECTED" as InviteStatus,
    };

    const rejectedInvite = {
      ...mockInvite,
      status: "REJECTED" as InviteStatus,
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      rejectedInvite
    );

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "REJECTED",
      tx: undefined,
    });
    expect(result).toEqual(rejectedInvite);
  });

  it("should update invite status to PENDING and return invite", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "PENDING" as InviteStatus,
    };

    const pendingInvite = {
      ...mockInvite,
      status: "PENDING" as InviteStatus,
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      pendingInvite
    );

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "PENDING",
      tx: undefined,
    });
    expect(result).toEqual(pendingInvite);
  });

  it("should use transaction when provided", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
      tx: mockTransaction,
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
      tx: mockTransaction,
    });
    expect(result).toEqual(mockInvite);
  });

  it("should handle different invite IDs correctly", async () => {
    // Arrange
    const differentInviteId = "invite-456";
    const input = {
      inviteId: differentInviteId,
      status: "ACCEPTED" as InviteStatus,
    };

    const differentInvite = {
      ...mockInvite,
      id: differentInviteId,
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      differentInvite
    );

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: differentInviteId,
      status: "ACCEPTED",
      tx: undefined,
    });
    expect(result).toEqual(differentInvite);
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
    };

    (updateInviteStatusRepository as jest.Mock).mockRejectedValue(
      new Error("Failed to update invite status")
    );

    // Act & Assert
    await expect(updateInviteStatusService(input)).rejects.toThrow(
      "Failed to update invite status"
    );
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
      tx: undefined,
    });
  });

  it("should throw error when repository throws with transaction", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
      tx: mockTransaction,
    };

    (updateInviteStatusRepository as jest.Mock).mockRejectedValue(
      new Error("Transaction failed")
    );

    // Act & Assert
    await expect(updateInviteStatusService(input)).rejects.toThrow(
      "Transaction failed"
    );
    expect(updateInviteStatusRepository).toHaveBeenCalledWith({
      inviteId: "invite-123",
      status: "ACCEPTED",
      tx: mockTransaction,
    });
  });

  it("should return invite with organization data", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
    };

    const inviteWithOrgData = {
      ...mockInvite,
      organization: {
        id: "org-456",
        name: "Another Organization",
        slug: "another-org",
      },
    };

    (updateInviteStatusRepository as jest.Mock).mockResolvedValue(
      inviteWithOrgData
    );

    // Act
    const result = await updateInviteStatusService(input);

    // Assert
    expect(result.organization).toEqual({
      id: "org-456",
      name: "Another Organization",
      slug: "another-org",
    });
    expect(result.status).toBe("ACCEPTED");
  });
});
