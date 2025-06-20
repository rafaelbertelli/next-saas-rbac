import { prisma } from "@/infra/prisma/prisma-connection";
import { amountOfProjectsRepository } from "./amount-of-projects.repository";

// Mock Prisma
jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    project: {
      count: jest.fn(),
    },
  },
}));

describe("amountOfProjectsRepository", () => {
  const organizationId = "org-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct amount of projects", async () => {
    // Arrange
    const expectedCount = 5;
    (prisma.project.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfProjectsRepository({ organizationId });

    // Assert
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
    expect(result).toBe(expectedCount);
  });

  it("should return zero when organization has no projects", async () => {
    // Arrange
    const expectedCount = 0;
    (prisma.project.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfProjectsRepository({ organizationId });

    // Assert
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
    expect(result).toBe(0);
  });

  it("should return one when organization has exactly one project", async () => {
    // Arrange
    const expectedCount = 1;
    (prisma.project.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfProjectsRepository({ organizationId });

    // Assert
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
    expect(result).toBe(1);
  });

  it("should return large number when organization has many projects", async () => {
    // Arrange
    const expectedCount = 100;
    (prisma.project.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfProjectsRepository({ organizationId });

    // Assert
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
    expect(result).toBe(100);
  });

  it("should handle database errors", async () => {
    // Arrange
    const dbError = new Error("Database connection failed");
    (prisma.project.count as jest.Mock).mockRejectedValue(dbError);

    // Act & Assert
    await expect(
      amountOfProjectsRepository({ organizationId })
    ).rejects.toThrow("Failed to get amount of projects");

    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
  });

  it("should handle Prisma specific errors", async () => {
    // Arrange
    const prismaError = new Error("P2002: Unique constraint failed");
    (prisma.project.count as jest.Mock).mockRejectedValue(prismaError);

    // Act & Assert
    await expect(
      amountOfProjectsRepository({ organizationId })
    ).rejects.toThrow("Failed to get amount of projects");

    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
    });
  });

  it("should work with different organization IDs", async () => {
    // Arrange
    const differentOrgId = "org-456";
    const expectedCount = 3;
    (prisma.project.count as jest.Mock).mockResolvedValue(expectedCount);

    // Act
    const result = await amountOfProjectsRepository({
      organizationId: differentOrgId,
    });

    // Assert
    expect(prisma.project.count).toHaveBeenCalledWith({
      where: {
        organizationId: differentOrgId,
      },
    });
    expect(result).toBe(expectedCount);
  });
});
