import { Role } from "@/generated/prisma";
import { deleteProjectByIdRepository } from "@/repositories/projects/delete-project-by-id";
import { getProjectByIdRepository } from "@/repositories/projects/get-project-by-id";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { deleteProjectService } from "./delete-project.service";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/projects/get-project-by-id");
jest.mock("@/repositories/projects/delete-project-by-id");

describe("deleteProjectService", () => {
  const userId = "user-1";
  const slug = "org-slug";
  const projectId = "proj-1";
  const organization = {
    id: "org-1",
    name: "Org Name",
    slug: "org-slug",
    domain: null,
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };
  const membership = {
    id: "membership-1",
    role: Role.ADMIN,
    userId: userId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };
  const mockProject = {
    id: projectId,
    name: "Test Project",
    slug: "test-project",
    description: "A test project description",
    avatarUrl: null,
    ownerId: userId,
    organizationId: organization.id,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a project and return it", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectByIdRepository).mockResolvedValueOnce(mockProject);
    jest.mocked(deleteProjectByIdRepository).mockResolvedValueOnce(mockProject);

    // Act
    const result = await deleteProjectService({
      userId,
      slug,
      projectId,
    });

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug: slug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      organizationId: organization.id,
    });
    expect(deleteProjectByIdRepository).toHaveBeenCalledWith({
      id: projectId,
    });
    expect(result).toEqual(mockProject);
  });

  it("should throw ForbiddenError if user cannot delete project", async () => {
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
      deleteProjectService({ userId, slug, projectId })
    ).rejects.toThrow(ForbiddenError);
    expect(getProjectByIdRepository).not.toHaveBeenCalled();
    expect(deleteProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if project is not found", async () => {
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
      deleteProjectService({ userId, slug, projectId })
    ).rejects.toThrow(NotFoundError);
    expect(getProjectByIdRepository).toHaveBeenCalledWith({
      projectId,
      organizationId: organization.id,
    });
    expect(deleteProjectByIdRepository).not.toHaveBeenCalled();
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
      deleteProjectService({ userId, slug, projectId })
    ).rejects.toThrow("Failed to get project by id");
    expect(deleteProjectByIdRepository).not.toHaveBeenCalled();
  });

  it("should throw if deleteProjectByIdRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectByIdRepository).mockResolvedValueOnce(mockProject);
    jest
      .mocked(deleteProjectByIdRepository)
      .mockRejectedValueOnce(new Error("Failed to delete project by id"));

    // Act & Assert
    await expect(
      deleteProjectService({ userId, slug, projectId })
    ).rejects.toThrow("Failed to delete project by id");
  });

  it("should throw if getUserMembershipOrganizationService throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      deleteProjectService({ userId, slug, projectId })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getProjectByIdRepository).not.toHaveBeenCalled();
    expect(deleteProjectByIdRepository).not.toHaveBeenCalled();
  });
});
