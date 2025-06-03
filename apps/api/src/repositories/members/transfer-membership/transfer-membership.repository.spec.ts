import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { transferMembershipRepository } from "./transfer-membership.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      update: jest.fn(),
    },
  },
}));

describe("updateMembershipRepository", () => {
  const userId = "user-1";
  const organizationId = "org-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return updated membership when update is successful", async () => {
    const updatedMembership = {
      id: "membership-1",
      userId,
      organizationId,
      role: Role.ADMIN,
    };
    (prisma.member.update as jest.Mock).mockResolvedValue(updatedMembership);

    const result = await transferMembershipRepository({
      organizationId,
      userId,
      role: Role.ADMIN,
    });
    expect(result).toEqual(updatedMembership);
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: {
        role: Role.ADMIN,
      },
    });
  });

  it("should throw error when prisma throws", async () => {
    (prisma.member.update as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    await expect(
      transferMembershipRepository({ organizationId, userId })
    ).rejects.toThrow("Failed to update membership");
  });
});
