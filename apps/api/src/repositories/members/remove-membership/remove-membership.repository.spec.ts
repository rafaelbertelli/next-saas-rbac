import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { removeMembershipRepository } from "./remove-membership.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      delete: jest.fn(),
    },
  },
}));

describe("removeMembershipRepository", () => {
  const organizationId = "org-1";
  const memberId = "member-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return deleted membership when delete is successful", async () => {
    // Arrange
    const deletedMembership = {
      id: memberId,
      userId: "user-1",
      organizationId,
      role: Role.MEMBER,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.delete).mockResolvedValueOnce(deletedMembership);

    // Act
    const result = await removeMembershipRepository({
      organizationId,
      memberId,
    });

    // Assert
    expect(prisma.member.delete).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
    });
    expect(result).toEqual(deletedMembership);
  });

  it("should throw error when prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.member.delete)
      .mockRejectedValueOnce(new Error("Database error"));

    // Act & Assert
    await expect(
      removeMembershipRepository({ organizationId, memberId })
    ).rejects.toThrow("Failed to remove membership");
  });

  it("should handle different member and organization IDs", async () => {
    // Arrange
    const differentMemberId = "member-2";
    const differentOrgId = "org-2";
    const deletedMembership = {
      id: differentMemberId,
      userId: "user-2",
      organizationId: differentOrgId,
      role: Role.ADMIN,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.delete).mockResolvedValueOnce(deletedMembership);

    // Act
    const result = await removeMembershipRepository({
      organizationId: differentOrgId,
      memberId: differentMemberId,
    });

    // Assert
    expect(prisma.member.delete).toHaveBeenCalledWith({
      where: {
        id: differentMemberId,
        organizationId: differentOrgId,
      },
    });
    expect(result).toEqual(deletedMembership);
  });

  it("should handle record not found error", async () => {
    // Arrange
    jest
      .mocked(prisma.member.delete)
      .mockRejectedValueOnce(new Error("Record to delete does not exist"));

    // Act & Assert
    await expect(
      removeMembershipRepository({ organizationId, memberId })
    ).rejects.toThrow("Failed to remove membership");

    expect(prisma.member.delete).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
    });
  });

  it("should handle constraint violation error", async () => {
    // Arrange
    jest
      .mocked(prisma.member.delete)
      .mockRejectedValueOnce(new Error("Foreign key constraint failed"));

    // Act & Assert
    await expect(
      removeMembershipRepository({ organizationId, memberId })
    ).rejects.toThrow("Failed to remove membership");
  });
});
