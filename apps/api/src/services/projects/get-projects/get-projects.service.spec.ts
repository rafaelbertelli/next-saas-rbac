import { Role } from "@/generated/prisma";
import { getProjectsByOrganizationRepository } from "@/repositories/projects/get-projects-by-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { getProjectsService } from "./get-projects.service";

jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/projects/get-projects-by-organization");

describe("getProjectsService", () => {
  const userId = "user-1";
  const organizationSlug = "org-slug";
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
  const mockProjects = [
    {
      id: "proj-1",
      name: "Project 1",
      slug: "project-1",
      description: "A first test project",
      avatarUrl: null,
      ownerId: userId,
      organizationId: organization.id,
      createdAt: new Date("2024-01-02T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      owner: {
        id: userId,
        name: "User Name",
        email: "user@example.com",
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
      organizationId: organization.id,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return projects when user has permission", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectsByOrganizationRepository)
      .mockResolvedValueOnce(mockProjects);

    // Act
    const result = await getProjectsService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getProjectsByOrganizationRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
    });
    expect(result).toEqual(mockProjects);
  });

  it("should return empty array when no projects exist", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest.mocked(getProjectsByOrganizationRepository).mockResolvedValueOnce([]);

    // Act
    const result = await getProjectsService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(getProjectsByOrganizationRepository).toHaveBeenCalledWith({
      organizationId: organization.id,
    });
    expect(result).toEqual([]);
  });

  it("should throw ForbiddenError if user cannot get projects", async () => {
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
      getProjectsService({ userId, organizationSlug })
    ).rejects.toThrow(
      new ForbiddenError(
        "User does not have permission to get projects from this organization"
      )
    );
    expect(getProjectsByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw if getUserMembershipOrganization throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockRejectedValueOnce(new Error("Organization not found"));

    // Act & Assert
    await expect(
      getProjectsService({ userId, organizationSlug })
    ).rejects.toThrow("Organization not found");
    expect(getUserPermissions).not.toHaveBeenCalled();
    expect(getProjectsByOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should throw if getProjectsByOrganizationRepository throws", async () => {
    // Arrange
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectsByOrganizationRepository)
      .mockRejectedValueOnce(
        new Error("Failed to get projects by organization")
      );

    // Act & Assert
    await expect(
      getProjectsService({ userId, organizationSlug })
    ).rejects.toThrow("Failed to get projects by organization");
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
    jest
      .mocked(getProjectsByOrganizationRepository)
      .mockResolvedValueOnce(mockProjects);

    // Act
    const result = await getProjectsService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.MEMBER);
    expect(result).toEqual(mockProjects);
  });

  it("should handle BILLING role correctly", async () => {
    // Arrange
    const billingMembership = {
      ...membership,
      role: Role.BILLING,
    };
    jest
      .mocked(getUserMembershipOrganization)
      .mockResolvedValueOnce({ organization, membership: billingMembership });
    jest.mocked(getUserPermissions).mockReturnValue({
      can: () => true,
      cannot: () => false,
    });
    jest
      .mocked(getProjectsByOrganizationRepository)
      .mockResolvedValueOnce(mockProjects);

    // Act
    const result = await getProjectsService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, Role.BILLING);
    expect(result).toEqual(mockProjects);
  });
});
