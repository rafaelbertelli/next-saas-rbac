import { prisma } from "@/infra/prisma/prisma-connection";
import { getInvitesByOrganizationRepository } from "./get-invites-by-organization.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      findMany: jest.fn(),
    },
  },
}));

describe("getInvitesByOrganizationRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const organizationId = "org-123";

  const mockInvites = [
    {
      id: "invite-1",
      email: "user1@example.com",
      role: "MEMBER",
      status: "PENDING",
      organizationId: "org-123",
      inviterId: "inviter-123",
      createdAt: new Date("2024-01-01T10:00:00Z"),
      updatedAt: new Date("2024-01-01T10:00:00Z"),
      inviter: {
        id: "inviter-123",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar.jpg",
      },
    },
    {
      id: "invite-2",
      email: "user2@example.com",
      role: "ADMIN",
      status: "PENDING",
      organizationId: "org-123",
      inviterId: "inviter-456",
      createdAt: new Date("2024-01-01T09:00:00Z"),
      updatedAt: new Date("2024-01-01T09:00:00Z"),
      inviter: {
        id: "inviter-456",
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: null,
      },
    },
  ];

  it("should return invites for organization with correct query parameters", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
        status: "PENDING",
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("should return empty array when no invites found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue([]);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return invites ordered by createdAt desc", async () => {
    // Arrange
    const orderedInvites = [
      { ...mockInvites[0], createdAt: new Date("2024-01-02T10:00:00Z") },
      { ...mockInvites[1], createdAt: new Date("2024-01-01T10:00:00Z") },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(orderedInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(orderedInvites);
    expect(result[0]?.createdAt.getTime()).toBeGreaterThan(
      result[1]?.createdAt.getTime()!
    );
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
    const pendingInvites = mockInvites.filter(
      (invite) => invite.status === "PENDING"
    );
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(pendingInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(pendingInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PENDING",
        }),
      })
    );
  });

  it("should include inviter data with correct fields", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      })
    );

    // Verify inviter data structure
    result.forEach((invite) => {
      if (invite.inviter) {
        expect(invite.inviter).toHaveProperty("id");
        expect(invite.inviter).toHaveProperty("name");
        expect(invite.inviter).toHaveProperty("email");
        expect(invite.inviter).toHaveProperty("avatarUrl");
      }
    });
  });

  it("should throw error when prisma operation fails", async () => {
    // Arrange
    const prismaError = new Error("Database connection failed");
    jest.mocked(prisma.invite.findMany).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(
      getInvitesByOrganizationRepository(organizationId)
    ).rejects.toThrow("Failed to fetch invites");

    expect(prisma.invite.findMany).toHaveBeenCalledTimes(1);
  });

  it("should handle different organization IDs correctly", async () => {
    // Arrange
    const differentOrgId = "org-456";
    const differentOrgInvites = [
      { ...mockInvites[0], id: "invite-3", organizationId: differentOrgId },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(differentOrgInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(differentOrgId);

    // Assert
    expect(result).toEqual(differentOrgInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: differentOrgId,
        }),
      })
    );
  });
});
