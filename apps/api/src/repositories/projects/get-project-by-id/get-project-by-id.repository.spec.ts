import { prisma } from "@/infra/prisma/prisma-connection";
import { getProjectByIdRepository } from "./get-project-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getProjectByIdRepository", () => {
  const id = "test-project-id";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the project when found", async () => {
    // Arrange
    const mockProject = {
      id: "proj-1",
      name: "Test Project",
      slug: "test-project",
      description: "A test project description",
      avatarUrl: null,
      ownerId: "user-1",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.findUnique).mockResolvedValueOnce(mockProject);

    // Act
    const result = await getProjectByIdRepository({
      projectId: id,
      organizationId: "org-1",
    });

    // Assert
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: {
        id,
        organizationId: "org-1",
      },
    });
    expect(result).toBe(mockProject);
  });

  it("should return null when project is not found", async () => {
    // Arrange
    jest.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

    // Act
    const result = await getProjectByIdRepository({
      projectId: id,
      organizationId: "org-1",
    });

    // Assert
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: {
        id,
        organizationId: "org-1",
      },
    });
    expect(result).toBeNull();
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.project.findUnique)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(getProjectByIdRepository({ id })).rejects.toThrow(
      "Failed to get project by id"
    );
  });
});
