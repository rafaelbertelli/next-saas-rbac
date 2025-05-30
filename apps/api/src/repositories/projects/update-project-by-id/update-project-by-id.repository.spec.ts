import { prisma } from "@/infra/prisma/prisma-connection";
import { updateProjectByIdRepository } from "./update-project-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("updateProjectByIdRepository", () => {
  const projectId = "proj-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update and return the project", async () => {
    // Arrange
    const updateData = {
      projectId,
      name: "Updated Project",
      description: "Updated description",
      avatarUrl: "https://example.com/avatar.png",
    };
    const mockProject = {
      id: projectId,
      name: updateData.name,
      slug: "updated-project",
      description: updateData.description,
      avatarUrl: updateData.avatarUrl,
      ownerId: "user-1",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.update).mockResolvedValueOnce(mockProject);

    // Act
    const result = await updateProjectByIdRepository(updateData);

    // Assert
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        name: updateData.name,
        description: updateData.description,
        avatarUrl: updateData.avatarUrl,
      },
    });
    expect(result).toBe(mockProject);
  });

  it("should update only provided fields", async () => {
    // Arrange
    const updateData = {
      projectId,
      name: "Updated Project",
    };
    const mockProject = {
      id: projectId,
      name: updateData.name,
      slug: "test-project",
      description: "Original description",
      avatarUrl: null,
      ownerId: "user-1",
      organizationId: "org-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.update).mockResolvedValueOnce(mockProject);

    // Act
    const result = await updateProjectByIdRepository(updateData);

    // Assert
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: {
        name: updateData.name,
      },
    });
    expect(result).toBe(mockProject);
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    const updateData = {
      projectId,
      name: "Updated Project",
    };
    jest
      .mocked(prisma.project.update)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(updateProjectByIdRepository(updateData)).rejects.toThrow(
      "Failed to update project by id"
    );
  });
});
