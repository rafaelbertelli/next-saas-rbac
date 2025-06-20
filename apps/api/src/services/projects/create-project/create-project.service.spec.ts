import { Role } from "@/generated/prisma";
import { createProjectRepository } from "@/repositories/projects/create-project";
import { getProjectBySlugRepository } from "@/repositories/projects/get-project-by-slug";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { createSlug } from "@/utils/slug/create-slug";
import { createProjectService } from "./";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/projects/create-project");
jest.mock("@/repositories/projects/get-project-by-slug");
jest.mock("@/utils/slug/create-slug");

describe("createProjectService", () => {
  const userId = "user-1";
  const slug = "org-slug";
  const name = "Project Name";
  const description = "Project Description";
  const projectSlug = "project-name";
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
  const createdProject = {
    id: "proj-1",
    organizationId: organization.id,
    name,
    slug: projectSlug,
    description,
    avatarUrl: null,
    ownerId: userId,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(createSlug).mockReturnValue(projectSlug);
  });

  it("should create a project and return it", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectBySlugRepository).mockResolvedValueOnce(null);
    jest.mocked(createProjectRepository).mockResolvedValueOnce(createdProject);

    // Act
    const result = await createProjectService({
      userId,
      slug,
      name,
      description,
    });

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug: slug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(createSlug).toHaveBeenCalledWith(name);
    expect(getProjectBySlugRepository).toHaveBeenCalledWith({
      slug: projectSlug,
      organizationId: organization.id,
    });
    expect(createProjectRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
      name,
      description,
      slug: projectSlug,
      ownerId: userId,
    });
    expect(result).toEqual(createdProject);
  });

  it("should throw ForbiddenError if user cannot create project", async () => {
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
      createProjectService({ userId, slug, name, description })
    ).rejects.toThrow(ForbiddenError);
    expect(getProjectBySlugRepository).not.toHaveBeenCalled();
    expect(createProjectRepository).not.toHaveBeenCalled();
  });

  it("should throw ConflictError if project with slug already exists", async () => {
    // Arrange
    const existingProject = {
      id: "existing-proj-1",
      name: "Existing Project",
      slug: projectSlug,
      description: "An existing project",
      avatarUrl: null,
      ownerId: "other-user-1",
      organizationId: organization.id,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        domain: organization.domain,
        avatarUrl: organization.avatarUrl,
        shouldAttachUsersByDomain: organization.shouldAttachUsersByDomain,
        ownerId: organization.ownerId,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      owner: {
        id: "other-user-1",
        name: "Other User",
        email: "other@example.com",
        avatarUrl: null,
        passwordHash: null,
        githubId: null,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    };
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectBySlugRepository)
      .mockResolvedValueOnce(existingProject);

    // Act & Assert
    await expect(
      createProjectService({ userId, slug, name, description })
    ).rejects.toThrow(ConflictError);
    expect(getProjectBySlugRepository).toHaveBeenCalledWith({
      slug: projectSlug,
      organizationId: organization.id,
    });
    expect(createProjectRepository).not.toHaveBeenCalled();
  });

  it("should throw if createProjectRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectBySlugRepository).mockResolvedValueOnce(null);
    jest
      .mocked(createProjectRepository)
      .mockRejectedValueOnce(new Error("DB error"));

    // Act & Assert
    await expect(
      createProjectService({ userId, slug, name, description })
    ).rejects.toThrow("DB error");
  });

  it("should throw if getProjectBySlugRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectBySlugRepository)
      .mockRejectedValueOnce(new Error("Failed to get project by slug"));

    // Act & Assert
    await expect(
      createProjectService({ userId, slug, name, description })
    ).rejects.toThrow("Failed to get project by slug");
    expect(createProjectRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganizationService throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      createProjectService({ userId, slug, name, description })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getProjectBySlugRepository).not.toHaveBeenCalled();
    expect(createProjectRepository).not.toHaveBeenCalled();
  });
});
