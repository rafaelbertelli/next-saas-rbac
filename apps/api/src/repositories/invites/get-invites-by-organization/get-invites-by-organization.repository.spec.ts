import { InviteStatus } from "@/generated/prisma";
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
      status: "ACCEPTED",
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

  it("should return all invites for organization when no status filter provided", async () => {
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

  it("should return invites filtered by status when status is provided", async () => {
    // Arrange
    const pendingInvites = mockInvites.filter(
      (invite) => invite.status === "PENDING"
    );
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(pendingInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(
      organizationId,
      "PENDING"
    );

    // Assert
    expect(result).toEqual(pendingInvites);
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

  it("should return invites filtered by ACCEPTED status", async () => {
    // Arrange
    const acceptedInvites = mockInvites.filter(
      (invite) => invite.status === "ACCEPTED"
    );
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(acceptedInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(
      organizationId,
      "ACCEPTED"
    );

    // Assert
    expect(result).toEqual(acceptedInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId,
          status: "ACCEPTED",
        }),
      })
    );
  });

  it("should return invites filtered by REJECTED status", async () => {
    // Arrange
    const rejectedInvites = [
      { ...mockInvites[0], status: "REJECTED" as InviteStatus },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(rejectedInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(
      organizationId,
      "REJECTED"
    );

    // Assert
    expect(result).toEqual(rejectedInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId,
          status: "REJECTED",
        }),
      })
    );
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
    expect(result[0]?.createdAt?.getTime()).toBeGreaterThan(
      result[1]?.createdAt?.getTime() ?? 0
    );
    expect(prisma.invite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          createdAt: "desc",
        },
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

  it("should handle organization with mixed invite statuses when no filter applied", async () => {
    // Arrange
    const mixedStatusInvites = [
      { ...mockInvites[0], status: "PENDING" as InviteStatus },
      { ...mockInvites[1], status: "ACCEPTED" as InviteStatus },
      { ...mockInvites[0], id: "invite-3", status: "REJECTED" as InviteStatus },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(mixedStatusInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(mixedStatusInvites);
    expect(result.length).toBe(3);
    expect(result.some((invite) => invite.status === "PENDING")).toBe(true);
    expect(result.some((invite) => invite.status === "ACCEPTED")).toBe(true);
    expect(result.some((invite) => invite.status === "REJECTED")).toBe(true);
  });

  it("should handle inviter with null avatarUrl", async () => {
    // Arrange
    const inviteWithNullAvatar = [
      {
        ...mockInvites[0],
        inviter: {
          ...mockInvites[0]?.inviter,
          avatarUrl: null,
        },
      },
    ];
    jest
      .mocked(prisma.invite.findMany)
      .mockResolvedValue(inviteWithNullAvatar as any);

    // Act
    const result = await getInvitesByOrganizationRepository(organizationId);

    // Assert
    expect(result).toEqual(inviteWithNullAvatar);
    expect(result[0]?.inviter?.avatarUrl).toBeNull();
  });

  it("should handle undefined status parameter correctly", async () => {
    // Arrange
    jest.mocked(prisma.invite.findMany).mockResolvedValue(mockInvites as any);

    // Act
    const result = await getInvitesByOrganizationRepository(
      organizationId,
      undefined
    );

    // Assert
    expect(result).toEqual(mockInvites);
    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
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
});
