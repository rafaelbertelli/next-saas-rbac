import { prisma } from "@/infra/prisma/prisma-connection";
import { amountOfMembersNotBillableRepository } from "./amount-of-members-not-billable.repository";

// Mock Prisma
jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      count: jest.fn(),
    },
  },
}));

describe("amountOfMembersNotBillableRepository", () => {
  const organizationId = "org-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct amount of non-billable members", async () => {
    // Arrange
    const expectedCount = 3;
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
    expect(result).toBe(expectedCount);
  });

  it("should return zero when organization has no non-billable members", async () => {
    // Arrange
    const expectedCount = 0;
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
    expect(result).toBe(0);
  });

  it("should return one when organization has exactly one non-billable member", async () => {
    // Arrange
    const expectedCount = 1;
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
    expect(result).toBe(1);
  });

  it("should return large number when organization has many non-billable members", async () => {
    // Arrange
    const expectedCount = 50;
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
    expect(result).toBe(50);
  });

  it("should exclude BILLING members from count", async () => {
    // Arrange - This test verifies the filter logic is applied correctly
    const expectedCount = 2; // Assuming org has 2 ADMIN/MEMBER and 1 BILLING
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" }, // This is the key filter
      },
    });
    expect(result).toBe(2);
  });

  it("should handle database errors", async () => {
    // Arrange
    const dbError = new Error("Database connection failed");
    (prisma.member.count as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(
      amountOfMembersNotBillableRepository({ organizationId })
    ).rejects.toThrow("Failed to get amount of members not billable");

    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
  });

  it("should handle Prisma specific errors", async () => {
    // Arrange
    const prismaError = new Error("P2002: Unique constraint failed");
    (prisma.member.count as jest.Mock).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(
      amountOfMembersNotBillableRepository({ organizationId })
    ).rejects.toThrow("Failed to get amount of members not billable");

    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId,
        role: { not: "BILLING" },
      },
    });
  });

  it("should work with different organization IDs", async () => {
    // Arrange
    const differentOrgId = "org-456";
    const expectedCount = 7;
    (prisma.member.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfMembersNotBillableRepository({
      organizationId: differentOrgId,
    });

    // Assert
    expect(prisma.member.count).toHaveBeenCalledWith({
      where: {
        organizationId: differentOrgId,
        role: { not: "BILLING" },
      },
    });
    expect(result).toBe(expectedCount);
  });

  it("should handle timeout errors", async () => {
    // Arrange
    const timeoutError = new Error("Query timeout");
    (prisma.member.count as jest.Mock).mockRejectedValue(timeoutError);

    // Act & Assert
    await expect(
      amountOfMembersNotBillableRepository({ organizationId })
    ).rejects.toThrow("Failed to get amount of members not billable");
  });
});
