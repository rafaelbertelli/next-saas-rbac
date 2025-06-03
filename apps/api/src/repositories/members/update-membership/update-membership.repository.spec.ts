import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { updateMembershipRepository } from "./update-membership.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      update: jest.fn(),
    },
  },
}));

describe("updateMembershipRepository", () => {
  const organizationId = "org-1";
  const memberId = "member-1";
  const role = Role.ADMIN;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return updated membership when update is successful", async () => {
    // Arrange
    const updatedMembership = {
      id: memberId,
      userId: "user-1",
      organizationId,
      role,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.update).mockResolvedValueOnce(updatedMembership);

    // Act
    const result = await updateMembershipRepository({
      organizationId,
      memberId,
      role,
    });

    // Assert
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      data: {
        role,
      },
    });
    expect(result).toEqual(updatedMembership);
  });

  it("should throw error when prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.member.update)
      .mockRejectedValueOnce(new Error("Database error"));

    // Act & Assert
    await expect(
      updateMembershipRepository({ organizationId, memberId, role })
    ).rejects.toThrow("Failed to update membership");
  });

  it("should work with BILLING role", async () => {
    // Arrange
    const billingRole = Role.BILLING;
    const updatedMembership = {
      id: memberId,
      userId: "user-1",
      organizationId,
      role: billingRole,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.update).mockResolvedValueOnce(updatedMembership);

    // Act
    const result = await updateMembershipRepository({
      organizationId,
      memberId,
      role: billingRole,
    });

    // Assert
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      data: {
        role: billingRole,
      },
    });
    expect(result.role).toBe(billingRole);
  });

  it("should work with MEMBER role", async () => {
    // Arrange
    const memberRole = Role.MEMBER;
    const updatedMembership = {
      id: memberId,
      userId: "user-1",
      organizationId,
      role: memberRole,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.update).mockResolvedValueOnce(updatedMembership);

    // Act
    const result = await updateMembershipRepository({
      organizationId,
      memberId,
      role: memberRole,
    });

    // Assert
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      data: {
        role: memberRole,
      },
    });
    expect(result.role).toBe(memberRole);
  });

  it("should handle different member and organization IDs", async () => {
    // Arrange
    const differentMemberId = "member-2";
    const differentOrgId = "org-2";
    const updatedMembership = {
      id: differentMemberId,
      userId: "user-2",
      organizationId: differentOrgId,
      role,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.member.update).mockResolvedValueOnce(updatedMembership);

    // Act
    const result = await updateMembershipRepository({
      organizationId: differentOrgId,
      memberId: differentMemberId,
      role,
    });

    // Assert
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        id: differentMemberId,
        organizationId: differentOrgId,
      },
      data: {
        role,
      },
    });
    expect(result).toEqual(updatedMembership);
  });

  it("should handle prisma error with specific message", async () => {
    // Arrange
    jest
      .mocked(prisma.member.update)
      .mockRejectedValueOnce(new Error("Foreign key constraint failed"));

    // Act & Assert
    await expect(
      updateMembershipRepository({ organizationId, memberId, role })
    ).rejects.toThrow("Failed to update membership");

    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        id: memberId,
        organizationId,
      },
      data: {
        role,
      },
    });
  });
});
