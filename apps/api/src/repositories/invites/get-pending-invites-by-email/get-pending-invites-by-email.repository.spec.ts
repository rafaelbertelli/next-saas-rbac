import { prisma } from "@/infra/prisma/prisma-connection";
import { getPendingInvitesByEmailRepository } from "./get-pending-invites-by-email.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      findMany: jest.fn(),
    },
  },
}));

describe("getPendingInvitesByEmailRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockInvites = [
    {
      id: "invite-1",
      email: "john@example.com",
      role: "MEMBER",
      status: "PENDING",
      organizationId: "org-1",
      inviterId: "inviter-1",
      createdAt: new Date("2024-01-02T10:00:00Z"),
      updatedAt: new Date("2024-01-02T10:00:00Z"),
      organization: {
        id: "org-1",
        name: "Organization One",
        slug: "org-one",
        avatarUrl: "https://example.com/org1.jpg",
      },
      inviter: {
        id: "inviter-1",
        name: "John Inviter",
        email: "inviter1@example.com",
      },
    },
    {
      id: "invite-2",
      email: "john@example.com",
      role: "ADMIN",
      status: "PENDING",
      organizationId: "org-2",
      inviterId: "inviter-2",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
      organization: {
        id: "org-2",
        name: "Organization Two",
        slug: "org-two",
        avatarUrl: null,
      },
      inviter: {
        id: "inviter-2",
        name: "Jane Inviter",
        email: "inviter2@example.com",
      },
    },
  ];

  it("should return pending invites for email with correct query parameters", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      where: {
        email: "john@example.com",
        status: "PENDING",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("should return empty array when no pending invites found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue([]);

    // Act
    const result = await getPendingInvitesByEmailRepository(
      "noinvites@example.com"
    );

    // Assert
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return invites ordered by createdAt desc", async () => {
    // Arrange
    const orderedInvites = [
      { ...mockInvites[0], createdAt: new Date("2024-01-03T10:00:00Z") }, // Most recent
      { ...mockInvites[1], createdAt: new Date("2024-01-01T10:00:00Z") }, // Oldest
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(orderedInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(orderedInvites);
    if (result[0] && result[1] && result[0].createdAt && result[1].createdAt) {
      expect(result[0].createdAt.getTime()).toBeGreaterThan(
        result[1].createdAt.getTime()
      );
    }
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  });

  it("should only return PENDING invites", async () => {
    // Arrange
    const pendingOnlyInvites = mockInvites.filter(
      (invite) => invite.status === "PENDING"
    );
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(pendingOnlyInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(pendingOnlyInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PENDING",
        }),
      })
    );

    // Verify all returned invites are PENDING
    result.forEach((invite) => {
      expect(invite.status).toBe("PENDING");
    });
  });

  it("should include organization data with correct fields", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
        }),
      })
    );

    // Verify organization data structure
    result.forEach((invite) => {
      expect(invite.organization).toHaveProperty("id");
      expect(invite.organization).toHaveProperty("name");
      expect(invite.organization).toHaveProperty("slug");
      expect(invite.organization).toHaveProperty("avatarUrl");
    });
  });

  it("should include inviter data with correct fields", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }),
      })
    );

    // Verify inviter data structure
    result.forEach((invite) => {
      expect(invite.inviter).toHaveProperty("id");
      expect(invite.inviter).toHaveProperty("name");
      expect(invite.inviter).toHaveProperty("email");
    });
  });

  it("should handle different email addresses", async () => {
    // Arrange
    const differentEmail = "different@example.com";
    const differentInvites = [{ ...mockInvites[0], email: differentEmail }];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(differentInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository(differentEmail);

    // Assert
    expect(result).toEqual(differentInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: differentEmail,
        }),
      })
    );
  });

  it("should handle complex email formats", async () => {
    // Arrange
    const complexEmail = "user.name+tag@example-domain.co.uk";
    const complexEmailInvites = [{ ...mockInvites[0], email: complexEmail }];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(complexEmailInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository(complexEmail);

    // Assert
    expect(result).toEqual(complexEmailInvites);
    expect(result[0]?.email).toBe(complexEmail);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: complexEmail,
        }),
      })
    );
  });

  it("should handle invites with different roles", async () => {
    // Arrange
    const multiRoleInvites = [
      { ...mockInvites[0], role: "MEMBER" },
      { ...mockInvites[1], role: "ADMIN" },
      { ...mockInvites[0], id: "invite-3", role: "BILLING" },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(multiRoleInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(multiRoleInvites);
    expect(result.some((invite) => invite.role === "MEMBER")).toBe(true);
    expect(result.some((invite) => invite.role === "ADMIN")).toBe(true);
    expect(result.some((invite) => invite.role === "BILLING")).toBe(true);
  });

  it("should handle organization with null avatarUrl", async () => {
    // Arrange
    const invitesWithNullAvatar = [
      {
        ...mockInvites[0],
        organization: {
          ...mockInvites[0]?.organization,
          avatarUrl: null,
        },
      },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(invitesWithNullAvatar as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(invitesWithNullAvatar);
    expect(result[0]?.organization?.avatarUrl).toBeNull();
  });

  it("should handle invite with null inviterId", async () => {
    // Arrange
    const inviteWithoutInviter = [
      {
        ...mockInvites[0],
        inviterId: null,
        inviter: null,
      },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(inviteWithoutInviter as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(inviteWithoutInviter);
    expect(result[0]?.inviterId).toBeNull();
    expect(result[0]?.inviter).toBeNull();
  });

  it("should throw error when prisma operation fails", async () => {
    // Arrange
    const prismaError = new Error("Database connection failed");
    jest.mocked(prisma.invite.findMany).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(
      getPendingInvitesByEmailRepository("john@example.com")
    ).rejects.toThrow("Failed to fetch pending invites");

    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
  });

  it("should handle database timeout errors", async () => {
    // Arrange
    const timeoutError = new Error("Query timeout");
    jest.mocked(prisma.invite.findMany).mockRejectedValue(timeoutError);

    // Act & Assert
    await expect(
      getPendingInvitesByEmailRepository("john@example.com")
    ).rejects.toThrow("Failed to fetch pending invites");

    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      where: {
        email: "john@example.com",
        status: "PENDING",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("should handle generic database errors", async () => {
    // Arrange
    const genericError = new Error("Unexpected database error");
    jest.mocked(prisma.invite.findMany).mockRejectedValue(genericError);

    // Act & Assert
    await expect(
      getPendingInvitesByEmailRepository("john@example.com")
    ).rejects.toThrow("Failed to fetch pending invites");
  });

  it("should handle email case sensitivity", async () => {
    // Arrange
    const upperCaseEmail = "JOHN@EXAMPLE.COM";
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository(upperCaseEmail);

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: upperCaseEmail, // Should pass exactly as provided
        }),
      })
    );
  });

  it("should handle single invite result", async () => {
    // Arrange
    const singleInvite = [mockInvites[0]];
    jest.mocked(prisma.invite.findMany).mockResolvedValue(singleInvite as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(singleInvite);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(mockInvites[0]);
  });

  it("should handle multiple organizations for same email", async () => {
    // Arrange
    const multiOrgInvites = [
      { ...mockInvites[0], organizationId: "org-1" },
      { ...mockInvites[1], organizationId: "org-2" },
      { ...mockInvites[0], id: "invite-3", organizationId: "org-3" },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(multiOrgInvites as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("john@example.com");

    // Assert
    expect(result).toEqual(multiOrgInvites);
    expect(result.length).toBe(3);
    expect(new Set(result.map((invite) => invite.organizationId)).size).toBe(3);
  });

  it("should return exact prisma result without modification", async () => {
    // Arrange
    const prismaResult = [
      {
        id: "test-id",
        email: "test@example.com",
        role: "MEMBER",
        status: "PENDING",
        organizationId: "test-org",
        inviterId: "test-inviter",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        organization: {
          id: "org-id",
          name: "Test Org",
          slug: "test-slug",
          avatarUrl: "avatar.jpg",
        },
        inviter: {
          id: "inviter-id",
          name: "Test Inviter",
          email: "inviter@test.com",
        },
        customField: "should be preserved", // Extra field that might exist
      },
    ];
    jest.mocked(prisma.invite.findMany).mockResolvedValue(prismaResult as any);

    // Act
    const result = await getPendingInvitesByEmailRepository("test@example.com");

    // Assert
    expect(result).toEqual(prismaResult);
    expect(result).toBe(prismaResult); // Same reference
  });
});
