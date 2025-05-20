import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipByUserIdRepository } from "./get-membership-by-user-id.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getMembershipByUserIdRepository", () => {
  const userId = "user-1";
  const organizationId = "org-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return membership when found", async () => {
    const membership = { id: "membership-1", userId, organizationId };
    (prisma.member.findUnique as jest.Mock).mockResolvedValue(membership);

    const result = await getMembershipByUserIdRepository(
      userId,
      organizationId
    );
    expect(result).toEqual(membership);
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  });

  it("should return null when membership not found", async () => {
    (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getMembershipByUserIdRepository(
      userId,
      organizationId
    );
    expect(result).toBeNull();
  });

  it("should throw error when prisma throws", async () => {
    (prisma.member.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    await expect(
      getMembershipByUserIdRepository(userId, organizationId)
    ).rejects.toThrow("Failed to get membership by user id");
  });
});
