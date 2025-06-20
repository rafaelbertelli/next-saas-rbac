import { InviteStatus } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { updateInviteStatusRepository } from "./update-invite-status.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      update: jest.fn(),
    },
  },
}));

describe("updateInviteStatusRepository", () => {
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

  const mockTransaction = {
    invite: {
      update: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update invite status to ACCEPTED and return invite", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
    };

    (prisma.invite.update as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
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

    (prisma.invite.update as jest.Mock).mockResolvedValue(rejectedInvite);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "REJECTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
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

    (prisma.invite.update as jest.Mock).mockResolvedValue(pendingInvite);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "PENDING",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
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

    mockTransaction.invite.update.mockResolvedValue(mockInvite);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(mockTransaction.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(prisma.invite.update).not.toHaveBeenCalled();
    expect(result).toEqual(mockInvite);
  });

  it("should handle different invite IDs correctly", async () => {
    // Arrange
    const input = {
      inviteId: "invite-456",
      status: "ACCEPTED" as InviteStatus,
    };

    const differentInvite = {
      ...mockInvite,
      id: "invite-456",
    };

    (prisma.invite.update as jest.Mock).mockResolvedValue(differentInvite);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-456",
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(result).toEqual(differentInvite);
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

    (prisma.invite.update as jest.Mock).mockResolvedValue(inviteWithOrgData);

    // Act
    const result = await updateInviteStatusRepository(input);

    // Assert
    expect(result.organization).toEqual({
      id: "org-456",
      name: "Another Organization",
      slug: "another-org",
    });
    expect(result.status).toBe("ACCEPTED");
  });

  it("should throw 'Failed to update invite status' when prisma throws an error", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
    };

    (prisma.invite.update as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(updateInviteStatusRepository(input)).rejects.toThrow(
      "Failed to update invite status"
    );
    expect(prisma.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  });

  it("should throw 'Failed to update invite status' when transaction throws an error", async () => {
    // Arrange
    const input = {
      inviteId: "invite-123",
      status: "ACCEPTED" as InviteStatus,
      tx: mockTransaction,
    };

    mockTransaction.invite.update.mockRejectedValue(
      new Error("Transaction failed")
    );

    // Act & Assert
    await expect(updateInviteStatusRepository(input)).rejects.toThrow(
      "Failed to update invite status"
    );
    expect(mockTransaction.invite.update).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(prisma.invite.update).not.toHaveBeenCalled();
  });
});
