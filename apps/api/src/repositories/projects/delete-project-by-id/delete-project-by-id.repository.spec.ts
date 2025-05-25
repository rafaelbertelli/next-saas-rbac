import { prisma } from "@/infra/prisma/prisma-connection";
import { deleteProjectByIdRepository } from "./delete-project-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("deleteProjectByIdRepository", () => {
  const projectId = "proj-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete and return the project", async () => {
    // Arrange
    const mockProject = {
      id: projectId,
      name: "Test Project",
      slug: "test-project",
      description: "A test project description",
      avatarUrl: null,
      ownerId: "user-1",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.delete).mockResolvedValueOnce(mockProject);

    // Act
    const result = await deleteProjectByIdRepository({ id: projectId });

    // Assert
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: projectId },
    });
    expect(result).toBe(mockProject);
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.project.delete)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(
      deleteProjectByIdRepository({ id: projectId })
    ).rejects.toThrow("Failed to delete project by id");
  });
});
