import { prisma } from "@/infra/prisma/prisma-connection";
import { getProjectBySlugRepository } from "./get-project-by-slug.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getProjectBySlugRepository", () => {
  const slug = "test-project";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the project when found", async () => {
    // Arrange
    const mockProject = {
      id: "proj-1",
      name: "Test Project",
      slug,
      description: "A test project description",
      avatarUrl: null,
      ownerId: "user-1",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

    // Act
    const result = await getProjectBySlugRepository({ slug });

    // Assert
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { slug },
    });
    expect(result).toBe(mockProject);
  });

  it("should return null when project is not found", async () => {
    // Arrange
    jest.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

    // Act
    const result = await getProjectBySlugRepository({ slug });

    // Assert
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { slug },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.project.findUnique)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(getProjectBySlugRepository({ slug })).rejects.toThrow(
      "Failed to get project by slug"
    );
  });
});
