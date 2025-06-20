import { prisma } from "@/infra/prisma/prisma-connection";
import { getInviteByOrganizationRepository } from "./get-invite-by-organization.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getInviteByOrganizationRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockInvite = {
    id: "invite-123",
    email: "john@example.com",
    role: "MEMBER",
    status: "PENDING",
    organizationId: "org-123",
    inviterId: "inviter-123",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    updatedAt: new Date("2024-01-01T10:00:00Z"),
  };

  it("should return invite when found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findUnique).mockResolvedValue(mockInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(mockInvite);
    expect(prisma.invite.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: "org-123",
        id: "invite-123",
      },
    });
  });

  it("should return null when invite is not found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findUnique).mockResolvedValue(null);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toBeNull();
    expect(prisma.invite.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: "org-123",
        id: "invite-123",
      },
    });
  });

  it("should handle different organization and invite IDs", async () => {
    // Arrange
    const differentInvite = {
      ...mockInvite,
      id: "invite-456",
      organizationId: "org-456",
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(differentInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-456",
      "invite-456"
    );

    // Assert
    expect(result).toEqual(differentInvite);
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: "org-456",
        id: "invite-456",
      },
    });
  });

  it("should handle invites with different roles", async () => {
    // Arrange
    const adminInvite = {
      ...mockInvite,
      role: "ADMIN",
    };
    jest.mocked(prisma.invite.findUnique).mockResolvedValue(adminInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(adminInvite);
    expect(result?.role).toBe("ADMIN");
  });

  it("should handle invites with different statuses", async () => {
    // Arrange
    const acceptedInvite = {
      ...mockInvite,
      status: "ACCEPTED",
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(acceptedInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(acceptedInvite);
    expect(result?.status).toBe("ACCEPTED");
  });

  it("should handle invites with BILLING role", async () => {
    // Arrange
    const billingInvite = {
      ...mockInvite,
      role: "BILLING",
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(billingInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(billingInvite);
    expect(result?.role).toBe("BILLING");
  });

  it("should handle invites with REJECTED status", async () => {
    // Arrange
    const rejectedInvite = {
      ...mockInvite,
      status: "REJECTED",
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(rejectedInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(rejectedInvite);
    expect(result?.status).toBe("REJECTED");
  });

  it("should throw error when prisma operation fails", async () => {
    // Arrange
    const prismaError = new Error("Database connection failed");
    jest.mocked(prisma.invite.findUnique).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(
      getInviteByOrganizationRepository("org-123", "invite-123")
    ).rejects.toThrow("Failed to fetch invite");

    expect(prisma.invite.findUnique).toHaveBeenCalledTimes(1);
  });

  it("should handle invite with null inviterId", async () => {
    // Arrange
    const inviteWithoutInviter = {
      ...mockInvite,
      inviterId: null,
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(inviteWithoutInviter as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(inviteWithoutInviter);
    expect(result?.inviterId).toBeNull();
  });

  it("should handle different email formats", async () => {
    // Arrange
    const inviteWithComplexEmail = {
      ...mockInvite,
      email: "user.name+tag@example-domain.com",
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(inviteWithComplexEmail as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "org-123",
      "invite-123"
    );

    // Assert
    expect(result).toEqual(inviteWithComplexEmail);
    expect(result?.email).toBe("user.name+tag@example-domain.com");
  });

  it("should handle UUID format parameters correctly", async () => {
    // Arrange
    const uuidOrgId = "12345678-1234-1234-1234-123456789012";
    const uuidInviteId = "87654321-4321-4321-4321-210987654321";

    jest.mocked(prisma.invite.findUnique).mockResolvedValue(mockInvite as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      uuidOrgId,
      uuidInviteId
    );

    // Assert
    expect(result).toEqual(mockInvite);
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: uuidOrgId,
        id: uuidInviteId,
      },
    });
  });

  it("should handle database timeout errors", async () => {
    // Arrange
    const timeoutError = new Error("Query timeout");
    jest.mocked(prisma.invite.findUnique).mockRejectedValue(timeoutError);

    // Act & Assert
    await expect(
      getInviteByOrganizationRepository("org-123", "invite-123")
    ).rejects.toThrow("Failed to fetch invite");

    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: "org-123",
        id: "invite-123",
      },
    });
  });

  it("should handle generic database errors", async () => {
    // Arrange
    const genericError = new Error("Unexpected database error");
    jest.mocked(prisma.invite.findUnique).mockRejectedValue(genericError);

    // Act & Assert
    await expect(
      getInviteByOrganizationRepository("org-123", "invite-123")
    ).rejects.toThrow("Failed to fetch invite");
  });

  it("should call findUnique with exact parameters", async () => {
    // Arrange
    jest.mocked(prisma.invite.findUnique).mockResolvedValue(mockInvite as any);

    // Act
    await getInviteByOrganizationRepository("specific-org", "specific-invite");

    // Assert
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId: "specific-org",
        id: "specific-invite",
      },
    });
    expect(prisma.invite.findUnique).not.toHaveBeenCalledWith({
      where: {
        organizationId: "wrong-org",
        id: "specific-invite",
      },
    });
    expect(prisma.invite.findUnique).not.toHaveBeenCalledWith({
      where: {
        organizationId: "specific-org",
        id: "wrong-invite",
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
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValue(prismaResult as any);

    // Act
    const result = await getInviteByOrganizationRepository(
      "test-org",
      "test-id"
    );

    // Assert
    expect(result).toEqual(prismaResult);
    expect(result).toBe(prismaResult); // Same reference
  });
});
