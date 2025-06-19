import { InviteStatus, Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getInviteByIdRepository } from "./get-invite-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getInviteByIdRepository", () => {
  const inviteId = "invite-123";

  const mockInvite = {
    id: inviteId,
    email: "john@example.com",
    role: "MEMBER" as Role,
    status: "PENDING" as InviteStatus,
    inviterId: "user-123",
    organizationId: "org-123",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    organization: {
      id: "org-123",
      name: "Acme Inc",
      slug: "acme-inc",
      avatarUrl: "https://example.com/avatar.jpg",
    },
    inviter: {
      id: "user-123",
      name: "Jane Doe",
      email: "jane@example.com",
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the invite when found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findUnique).mockResolvedValueOnce(mockInvite);

    // Act
    const result = await getInviteByIdRepository(inviteId);

    // Assert
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        id: inviteId,
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
            avatarUrl: true,
          },
        },
      },
    });
    expect(result).toBe(mockInvite);
  });

  it("should return null when invite is not found", async () => {
    // Arrange
    jest.mocked(prisma.invite.findUnique).mockResolvedValueOnce(null);

    // Act
    const result = await getInviteByIdRepository(inviteId);

    // Assert
    expect(prisma.invite.findUnique).toHaveBeenCalledWith({
      where: {
        id: inviteId,
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
            avatarUrl: true,
          },
        },
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.invite.findUnique)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(getInviteByIdRepository(inviteId)).rejects.toThrow(
      "Failed to fetch invite"
    );
  });

  it("should handle invite without inviter (inviterId is null)", async () => {
    // Arrange
    const mockInviteWithoutInviter = {
      ...mockInvite,
      inviterId: null,
      inviter: null,
    };
    jest
      .mocked(prisma.invite.findUnique)
      .mockResolvedValueOnce(mockInviteWithoutInviter);

    // Act
    const result = await getInviteByIdRepository(inviteId);

    // Assert
    expect(result).toBe(mockInviteWithoutInviter);
    expect(result?.inviter).toBeNull();
  });

  it("should handle different invite statuses", async () => {
    // Arrange - Test with ACCEPTED status
    const acceptedInvite = {
      ...mockInvite,
      status: "ACCEPTED" as InviteStatus,
    };
    jest.mocked(prisma.invite.findUnique).mockResolvedValueOnce(acceptedInvite);

    // Act
    const result = await getInviteByIdRepository(inviteId);

    // Assert
    expect(result?.status).toBe("ACCEPTED");
  });

  it("should handle different roles", async () => {
    // Arrange - Test with ADMIN role
    const adminInvite = {
      ...mockInvite,
      role: "ADMIN" as Role,
    };
    jest.mocked(prisma.invite.findUnique).mockResolvedValueOnce(adminInvite);

    // Act
    const result = await getInviteByIdRepository(inviteId);

    // Assert
    expect(result?.role).toBe("ADMIN");
  });
});
