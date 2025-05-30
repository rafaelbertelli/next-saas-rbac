import { Role } from "@/generated/prisma";
import { getProjectBySlugRepository } from "@/repositories/projects/get-project-by-slug";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { getProjectService } from "./get-project.service";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/projects/get-project-by-slug");

describe("getProjectService", () => {
  const userId = "user-1";
  const organizationSlug = "org-slug";
  const projectSlug = "project-slug";
  const organization = {
    id: "org-1",
    name: "Org Name",
    slug: organizationSlug,
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
    id: "proj-1",
    name: "Test Project",
    slug: projectSlug,
    description: "A test project description",
    avatarUrl: null,
    ownerId: userId,
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
      id: userId,
      name: "User Name",
      email: "user@example.com",
      avatarUrl: null,
      passwordHash: null,
      githubId: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the project when user has permission and project exists", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectBySlugRepository).mockResolvedValueOnce(mockProject);

    // Act
    const result = await getProjectService({
      userId,
      organizationSlug,
      projectSlug,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getProjectBySlugRepository).toHaveBeenCalledWith({
      slug: projectSlug,
      organizationId: organization.id,
    });
    expect(result).toEqual(mockProject);
  });

  it("should throw ForbiddenError if user cannot get project", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => false,
      cannot: () => true,
    });

    // Act & Assert
    await expect(
      getProjectService({ userId, organizationSlug, projectSlug })
    ).rejects.toThrow(ForbiddenError);
    expect(getProjectBySlugRepository).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if project does not exist", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectBySlugRepository).mockResolvedValueOnce(null);

    // Act & Assert
    await expect(
      getProjectService({ userId, organizationSlug, projectSlug })
    ).rejects.toThrow(NotFoundError);
    expect(getProjectBySlugRepository).toHaveBeenCalledWith({
      slug: projectSlug,
      organizationId: organization.id,
    });
  });

  it("should throw if getUserMembershipOrganization throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      getProjectService({ userId, organizationSlug, projectSlug })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getProjectBySlugRepository).not.toHaveBeenCalled();
  });

  it("should throw if getProjectBySlugRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
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
      getProjectService({ userId, organizationSlug, projectSlug })
    ).rejects.toThrow("Failed to get project by slug");
  });

  it("should work with different user roles", async () => {
    // Arrange
    const memberMembership = {
      ...membership,
      role: Role.MEMBER,
    };
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership: memberMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectBySlugRepository).mockResolvedValueOnce(mockProject);

    // Act
    const result = await getProjectService({
      userId,
      organizationSlug,
      projectSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.MEMBER);
    expect(result).toEqual(mockProject);
  });
});
