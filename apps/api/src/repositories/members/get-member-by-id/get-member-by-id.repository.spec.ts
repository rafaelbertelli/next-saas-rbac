import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getMemberByIdRepository } from "./get-member-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getMemberByIdRepository", () => {
  const memberId = "member-1";
  const organizationId = "org-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return member when found", async () => {
    // Arrange
    const mockMember = {
      id: memberId,
      userId: "user-1",
      role: Role.MEMBER,
      organizationId,
    };
    jest
      .mocked(prisma.member.findUnique)
      .mockResolvedValueOnce(mockMember as any);

    // Act
    const result = await getMemberByIdRepository({
      memberId,
      organizationId,
    });

    // Assert
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        organizationId: true,
      },
    });
    expect(result).toEqual(mockMember);
  });

  it("should return null when member is not found", async () => {
    // Arrange
    jest.mocked(prisma.member.findUnique).mockResolvedValueOnce(null);

    // Act
    const result = await getMemberByIdRepository({
      memberId,
      organizationId,
    });

    // Assert
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        organizationId: true,
      },
    });
    expect(result).toBeNull();
  });

  it("should throw error when prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.member.findUnique)
      .mockRejectedValueOnce(new Error("Database error"));

    // Act & Assert
    await expect(
      getMemberByIdRepository({ memberId, organizationId })
    ).rejects.toThrow("Failed to get member by id");
  });

  it("should work with different member roles", async () => {
    // Arrange
    const mockAdminMember = {
      id: memberId,
      userId: "user-1",
      role: Role.ADMIN,
      organizationId,
    };
    jest
      .mocked(prisma.member.findUnique)
      .mockResolvedValueOnce(mockAdminMember as any);

    // Act
    const result = await getMemberByIdRepository({
      memberId,
      organizationId,
    });

    // Assert
    expect(result?.role).toBe(Role.ADMIN);
    expect(result).toEqual(mockAdminMember);
  });

  it("should work with different IDs", async () => {
    // Arrange
    const differentMemberId = "member-2";
    const differentOrgId = "org-2";
    const mockMember = {
      id: differentMemberId,
      userId: "user-2",
      role: Role.BILLING,
      organizationId: differentOrgId,
    };
    jest
      .mocked(prisma.member.findUnique)
      .mockResolvedValueOnce(mockMember as any);

    // Act
    const result = await getMemberByIdRepository({
      memberId: differentMemberId,
      organizationId: differentOrgId,
    });

    // Assert
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        id: differentMemberId,
        organizationId: differentOrgId,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        organizationId: true,
      },
    });
    expect(result).toEqual(mockMember);
  });

  it("should handle database connection errors", async () => {
    // Arrange
    jest
      .mocked(prisma.member.findUnique)
      .mockRejectedValueOnce(new Error("Connection timeout"));

    // Act & Assert
    await expect(
      getMemberByIdRepository({ memberId, organizationId })
    ).rejects.toThrow("Failed to get member by id");

    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        organizationId: true,
      },
    });
  });
});
