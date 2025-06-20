import { prisma } from "@/infra/prisma/prisma-connection";
import { deleteInviteRepository } from "./delete-invite.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      delete: jest.fn(),
    },
  },
}));

describe("deleteInviteRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDeletedInvite = {
    id: "invite-123",
    email: "john@example.com",
    role: "MEMBER",
    status: "PENDING",
    organizationId: "org-123",
    inviterId: "inviter-123",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
  };

  it("should delete invite successfully and return deleted invite", async () => {
    // Arrange
    jest
      .mocked(prisma.invite.delete)
      .mockResolvedValue(mockDeletedInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(mockDeletedInvite);
    expect(prisma.invite.delete).toHaveBeenCalledTimes(1);
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
    });
  });

  it("should handle different invite IDs", async () => {
    // Arrange
    const differentInvite = {
      ...mockDeletedInvite,
      id: "invite-456",
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(differentInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-456");

    // Assert
    expect(result).toEqual(differentInvite);
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "invite-456",
      },
    });
  });

  it("should handle UUID format invite IDs", async () => {
    // Arrange
    const uuidInviteId = "12345678-1234-1234-1234-123456789012";
    const uuidInvite = {
      ...mockDeletedInvite,
      id: uuidInviteId,
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(uuidInvite as any);

    // Act
    const result = await deleteInviteRepository(uuidInviteId);

    // Assert
    expect(result).toEqual(uuidInvite);
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: uuidInviteId,
      },
    });
  });

  it("should handle invites with different roles", async () => {
    // Arrange
    const adminInvite = {
      ...mockDeletedInvite,
      role: "ADMIN",
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(adminInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(adminInvite);
    expect(result.role).toBe("ADMIN");
  });

  it("should handle invites with different statuses", async () => {
    // Arrange
    const acceptedInvite = {
      ...mockDeletedInvite,
      status: "ACCEPTED",
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(acceptedInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(acceptedInvite);
    expect(result.status).toBe("ACCEPTED");
  });

  it("should handle invites with BILLING role", async () => {
    // Arrange
    const billingInvite = {
      ...mockDeletedInvite,
      role: "BILLING",
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(billingInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(billingInvite);
    expect(result.role).toBe("BILLING");
  });

  it("should handle invites with REJECTED status", async () => {
    // Arrange
    const rejectedInvite = {
      ...mockDeletedInvite,
      status: "REJECTED",
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(rejectedInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(rejectedInvite);
    expect(result.status).toBe("REJECTED");
  });

  it("should handle invite with null inviterId", async () => {
    // Arrange
    const inviteWithoutInviter = {
      ...mockDeletedInvite,
      inviterId: null,
    };
    jest
      .mocked(prisma.invite.delete)
      .mockResolvedValue(inviteWithoutInviter as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(inviteWithoutInviter);
    expect(result.inviterId).toBeNull();
  });

  it("should throw error when invite does not exist", async () => {
    // Arrange
    const notFoundError = new Error("Record to delete does not exist");
    jest.mocked(prisma.invite.delete).mockRejectedValue(notFoundError);

    // Act & Assert
    await expect(deleteInviteRepository("non-existent-invite")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "non-existent-invite",
      },
    });
  });

  it("should throw error when prisma operation fails", async () => {
    // Arrange
    const prismaError = new Error("Database connection failed");
    jest.mocked(prisma.invite.delete).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(deleteInviteRepository("invite-123")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledTimes(1);
  });

  it("should handle database timeout errors", async () => {
    // Arrange
    const timeoutError = new Error("Query timeout");
    jest.mocked(prisma.invite.delete).mockRejectedValue(timeoutError);

    // Act & Assert
    await expect(deleteInviteRepository("invite-123")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
    });
  });

  it("should handle foreign key constraint errors", async () => {
    // Arrange
    const constraintError = new Error("Foreign key constraint failed");
    jest.mocked(prisma.invite.delete).mockRejectedValue(constraintError);

    // Act & Assert
    await expect(deleteInviteRepository("invite-123")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "invite-123",
      },
    });
  });

  it("should call prisma delete with exact parameters", async () => {
    // Arrange
    jest
      .mocked(prisma.invite.delete)
      .mockResolvedValue(mockDeletedInvite as any);

    // Act
    await deleteInviteRepository("specific-invite-id");

    // Assert
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "specific-invite-id",
      },
    });
    expect(prisma.invite.delete).not.toHaveBeenCalledWith({
      where: {
        id: "wrong-invite-id",
      },
    });
  });

  it("should return exact prisma result without modification", async () => {
    // Arrange
    const prismaResult = {
      id: "test-id",
      email: "test@example.com",
      role: "MEMBER",
      status: "PENDING",
      organizationId: "test-org",
      inviterId: "test-inviter",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      customField: "should be preserved", // Extra field that might exist
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(prismaResult as any);

    // Act
    const result = await deleteInviteRepository("test-id");

    // Assert
    expect(result).toEqual(prismaResult);
    expect(result).toBe(prismaResult); // Same reference
  });

  it("should handle invites with complex email formats", async () => {
    // Arrange
    const inviteWithComplexEmail = {
      ...mockDeletedInvite,
      email: "user.name+tag@example-domain.com",
    };
    jest
      .mocked(prisma.invite.delete)
      .mockResolvedValue(inviteWithComplexEmail as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(inviteWithComplexEmail);
    expect(result.email).toBe("user.name+tag@example-domain.com");
  });

  it("should handle invites with recent timestamps", async () => {
    // Arrange
    const recentInvite = {
      ...mockDeletedInvite,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(recentInvite as any);

    // Act
    const result = await deleteInviteRepository("invite-123");

    // Assert
    expect(result).toEqual(recentInvite);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("should handle empty string invite ID gracefully", async () => {
    // Arrange
    const emptyIdError = new Error("Invalid invite ID");
    jest.mocked(prisma.invite.delete).mockRejectedValue(emptyIdError);

    // Act & Assert
    await expect(deleteInviteRepository("")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: "",
      },
    });
  });

  it("should handle very long invite IDs", async () => {
    // Arrange
    const longId = "a".repeat(100);
    const longIdInvite = {
      ...mockDeletedInvite,
      id: longId,
    };
    jest.mocked(prisma.invite.delete).mockResolvedValue(longIdInvite as any);

    // Act
    const result = await deleteInviteRepository(longId);

    // Assert
    expect(result).toEqual(longIdInvite);
    expect(prisma.invite.delete).toHaveBeenCalledWith({
      where: {
        id: longId,
      },
    });
  });

  it("should handle generic database errors", async () => {
    // Arrange
    const genericError = new Error("Unexpected database error");
    jest.mocked(prisma.invite.delete).mockRejectedValue(genericError);

    // Act & Assert
    await expect(deleteInviteRepository("invite-123")).rejects.toThrow(
      "Failed to delete invite"
    );

    expect(prisma.invite.delete).toHaveBeenCalledTimes(1);
  });
});
