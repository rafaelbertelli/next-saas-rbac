import { prisma } from "@/infra/prisma/prisma-connection";
import { createProjectRepository } from "./create-project.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("createProjectRepository", () => {
  const params = {
    organizationId: "org-1",
    name: "Test Project",
    description: "A test project",
    slug: "test-project",
    ownerId: "user-1",
  };

  it("should create a project and return it", async () => {
    // Arrange
    const mockProject = {
      id: "proj-1",
      name: params.name,
      slug: params.slug,
      description: params.description,
      avatarUrl: null,
      ownerId: params.ownerId,
      organizationId: params.organizationId,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(prisma.project.create).mockResolvedValueOnce(mockProject);

    // Act
    const result = await createProjectRepository(params);

    // Assert
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: params,
    });
    expect(result).toEqual(mockProject);
  });

  it("should throw an error if prisma.project.create fails", async () => {
    // Arrange
    jest
      .mocked(prisma.project.create)
      .mockRejectedValueOnce(new Error("DB error"));

    // Act & Assert
    await expect(createProjectRepository(params)).rejects.toThrow(
      "Failed to create project"
    );
  });
});
