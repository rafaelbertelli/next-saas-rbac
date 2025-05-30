import { prisma } from "@/infra/prisma/prisma-connection";
import { getProjectsByOrganizationRepository } from "./get-projects-by-organization.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getProjectsByOrganizationRepository", () => {
  const organizationId = "org-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return projects when found", async () => {
    // Arrange
    const mockProjects = [
      {
        id: "proj-1",
        name: "Project 1",
        slug: "project-1",
        description: "A first test project",
        avatarUrl: null,
        ownerId: "user-1",
        organizationId,
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        owner: {
          id: "user-1",
          name: "User One",
          email: "user1@example.com",
          avatarUrl: null,
        },
      },
      {
        id: "proj-2",
        name: "Project 2",
        slug: "project-2",
        description: "A second test project",
        avatarUrl: "https://example.com/avatar.png",
        ownerId: "user-2",
        organizationId,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        owner: {
          id: "user-2",
          name: "User Two",
          email: "user2@example.com",
          avatarUrl: "https://example.com/user2.png",
        },
      },
    ];
    jest.mocked(prisma.project.findMany).mockResolvedValueOnce(mockProjects);

    // Act
    const result = await getProjectsByOrganizationRepository({
      organizationId,
    });

    // Assert
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        ownerId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual(mockProjects);
  });

  it("should return empty array when no projects found", async () => {
    // Arrange
    jest.mocked(prisma.project.findMany).mockResolvedValueOnce([]);

    // Act
    const result = await getProjectsByOrganizationRepository({
      organizationId,
    });

    // Assert
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatarUrl: true,
        ownerId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual([]);
  });

  it("should throw an error if prisma throws", async () => {
    // Arrange
    jest
      .mocked(prisma.project.findMany)
      .mockRejectedValueOnce(new Error("Database connection error"));

    // Act & Assert
    await expect(
      getProjectsByOrganizationRepository({ organizationId })
    ).rejects.toThrow("Failed to get projects by organization");
  });
});
