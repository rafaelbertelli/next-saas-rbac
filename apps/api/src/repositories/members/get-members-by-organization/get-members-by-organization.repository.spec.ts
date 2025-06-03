import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembersByOrganizationRepository } from "./get-members-by-organization.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getMembersByOrganizationRepository", () => {
  const organizationId = "org-1";
  const mockMembers = [
    {
      id: "member-1",
      role: Role.ADMIN,
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "https://example.com/avatar1.png",
      },
    },
    {
      id: "member-2",
      role: Role.MEMBER,
      user: {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: null,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return members when found", async () => {
    // Arrange
    jest
      .mocked(prisma.member.findMany)
      .mockResolvedValueOnce(mockMembers as any);

    // Act
    const result = await getMembersByOrganizationRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });
    expect(result).toEqual(mockMembers);
  });

  it("should return empty array when no members exist", async () => {
    // Arrange
    jest.mocked(prisma.member.findMany).mockResolvedValueOnce([]);

    // Act
    const result = await getMembersByOrganizationRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        role: "asc",
      },
    });
    expect(result).toEqual([]);
  });

  it("should throw if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.member.findMany)
      .mockRejectedValueOnce(new Error("Database error"));

    // Act & Assert
    await expect(
      getMembersByOrganizationRepository({ organizationId })
    ).rejects.toThrow("Failed to get members by organization");
  });

  it("should handle members with different roles correctly", async () => {
    // Arrange
    const membersWithDifferentRoles = [
      {
        id: "member-1",
        role: Role.BILLING,
        user: {
          id: "user-1",
          name: "Billing User",
          email: "billing@example.com",
          avatarUrl: null,
        },
      },
      {
        id: "member-2",
        role: Role.ADMIN,
        user: {
          id: "user-2",
          name: "Admin User",
          email: "admin@example.com",
          avatarUrl: "https://example.com/admin.png",
        },
      },
    ];
    jest
      .mocked(prisma.member.findMany)
      .mockResolvedValueOnce(membersWithDifferentRoles as any);

    // Act
    const result = await getMembersByOrganizationRepository({
      organizationId,
    });

    // Assert
    expect(result).toEqual(membersWithDifferentRoles);
    expect(result[0]?.role).toBe(Role.BILLING);
    expect(result[1]?.role).toBe(Role.ADMIN);
  });
});
