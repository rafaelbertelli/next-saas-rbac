import { Role } from "@/generated/prisma";
import { getProjectByIdRepository } from "@/repositories/projects/get-project-by-id";
import { updateProjectByIdRepository } from "@/repositories/projects/update-project-by-id";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { updateProjectService } from "./update-project.service";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/projects/get-project-by-id");
jest.mock("@/repositories/projects/update-project-by-id");

describe("updateProjectService", () => {
  const userId = "user-1";
  const organizationSlug = "test-org";
  const projectId = "proj-1";
  const name = "Updated Project";
  const description = "Updated description";
  const avatarUrl = "https://example.com/avatar.png";

  const organization = {
    id: "org-1",
    name: "Test Organization",
    slug: organizationSlug,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    domain: null,
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
  };

  const membership = {
    id: "member-1",
    role: Role.ADMIN,
    userId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const existingProject = {
    id: projectId,
    name: "Original Project",
    slug: "original-project",
    description: "Original description",
    avatarUrl: null,
    ownerId: userId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const updatedProject = {
    ...existingProject,
    name,
    description,
    avatarUrl,
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a project successfully", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectByIdRepository)
      .mockResolvedValueOnce(existingProject);
    jest
      .mocked(updateProjectByIdRepository)
      .mockResolvedValueOnce(updatedProject);

    // Act
    const result = await updateProjectService({
      userId,
      organizationSlug,
      projectId,
      name,
      description,
      avatarUrl,
    });

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      organizationId: organization.id,
    });
    expect(updateProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      name,
      description,
      avatarUrl,
    });
    expect(result).toEqual(updatedProject);
  });

  it("should update project with only some fields", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectByIdRepository)
      .mockResolvedValueOnce(existingProject);
    jest.mocked(updateProjectByIdRepository).mockResolvedValueOnce({
      ...existingProject,
      description,
      avatarUrl,
    });

    // Act
    const result = await updateProjectService({
      userId,
      organizationSlug,
      projectId,
      description,
      avatarUrl,
    });

    // Assert
    expect(updateProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      name: undefined,
      description,
      avatarUrl,
    });
  });

  it("should update project with same name", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectByIdRepository)
      .mockResolvedValueOnce(existingProject);
    jest.mocked(updateProjectByIdRepository).mockResolvedValueOnce({
      ...existingProject,
      description,
    });

    // Act
    const result = await updateProjectService({
      userId,
      organizationSlug,
      projectId,
      name: existingProject.name,
      description,
    });

    // Assert
    expect(updateProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      name: existingProject.name,
      description,
      avatarUrl: undefined,
    });
  });

  it("should throw ForbiddenError if user cannot update project", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      updateProjectService({
        userId,
        organizationSlug,
        projectId,
        name,
      })
    ).rejects.toThrow(ForbiddenError);
    expect(getProjectByIdRepository).not.toHaveBeenCalled();
    expect(updateProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if project does not exist", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectByIdRepository).mockResolvedValueOnce(null);

    // Act & Assert
    await expect(
      updateProjectService({
        userId,
        organizationSlug,
        projectId,
        name,
      })
    ).rejects.toThrow(NotFoundError);
    expect(updateProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganizationService throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      updateProjectService({
        userId,
        organizationSlug,
        projectId,
        name,
      })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getProjectByIdRepository).not.toHaveBeenCalled();
    expect(updateProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw if getProjectByIdRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectByIdRepository)
      .mockRejectedValueOnce(new Error("Failed to get project by id"));

    // Act & Assert
    await expect(
      updateProjectService({
        userId,
        organizationSlug,
        projectId,
        name,
      })
    ).rejects.toThrow("Failed to get project by id");
    expect(updateProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw if updateProjectByIdRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectByIdRepository)
      .mockResolvedValueOnce(existingProject);
    jest
      .mocked(updateProjectByIdRepository)
      .mockRejectedValueOnce(new Error("Failed to update project"));

    // Act & Assert
    await expect(
      updateProjectService({
        userId,
        organizationSlug,
        projectId,
        name,
      })
    ).rejects.toThrow("Failed to update project");
  });
});
