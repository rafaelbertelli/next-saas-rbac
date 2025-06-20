import { createOrganizationRepository } from "@/repositories/organizations/create-organization";
import { createSlug } from "@/utils/slug/create-slug";
import { createOrganizationService } from "./create-organization.service";

// Mock dependencies
jest.mock("@/repositories/organizations/create-organization");
jest.mock("@/utils/slug/create-slug");

describe("createOrganizationService", () => {
  const mockOrganization = {
    id: "org-123",
    name: "Test Organization",
    slug: "test-organization",
    domain: "test.com",
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "user-123",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create organization successfully with all parameters", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      name: "Test Organization",
      domain: "test.com",
      shouldAttachUsersByDomain: true,
    };

    (createSlug as jest.Mock).mockReturnValue("test-organization");
    (createOrganizationRepository as jest.Mock).mockResolvedValue(
      mockOrganization
    );

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith("Test Organization");
    expect(createOrganizationRepository).toHaveBeenCalledWith({
      userId: "user-123",
      name: "Test Organization",
      domain: "test.com",
      slug: "test-organization",
      shouldAttachUsersByDomain: true,
    });
    expect(result).toEqual(mockOrganization);
  });

  it("should create organization with minimal parameters", async () => {
    // Arrange
    const input = {
      userId: "user-456",
      name: "Simple Org",
    };

    const expectedOrg = {
      ...mockOrganization,
      id: "org-456",
      name: "Simple Org",
      slug: "simple-org",
      domain: null,
      shouldAttachUsersByDomain: false,
      ownerId: "user-456",
    };

    (createSlug as jest.Mock).mockReturnValue("simple-org");
    (createOrganizationRepository as jest.Mock).mockResolvedValue(expectedOrg);

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith("Simple Org");
    expect(createOrganizationRepository).toHaveBeenCalledWith({
      userId: "user-456",
      name: "Simple Org",
      domain: undefined,
      slug: "simple-org",
      shouldAttachUsersByDomain: false,
    });
    expect(result).toEqual(expectedOrg);
  });

  it("should create organization with domain but shouldAttachUsersByDomain false", async () => {
    // Arrange
    const input = {
      userId: "user-789",
      name: "Domain Org",
      domain: "domain.com",
      shouldAttachUsersByDomain: false,
    };

    const expectedOrg = {
      ...mockOrganization,
      id: "org-789",
      name: "Domain Org",
      slug: "domain-org",
      domain: "domain.com",
      shouldAttachUsersByDomain: false,
      ownerId: "user-789",
    };

    (createSlug as jest.Mock).mockReturnValue("domain-org");
    (createOrganizationRepository as jest.Mock).mockResolvedValue(expectedOrg);

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith("Domain Org");
    expect(createOrganizationRepository).toHaveBeenCalledWith({
      userId: "user-789",
      name: "Domain Org",
      domain: "domain.com",
      slug: "domain-org",
      shouldAttachUsersByDomain: false,
    });
    expect(result).toEqual(expectedOrg);
  });

  it("should create organization with null domain", async () => {
    // Arrange
    const input = {
      userId: "user-111",
      name: "Null Domain Org",
      domain: null,
    };

    const expectedOrg = {
      ...mockOrganization,
      id: "org-111",
      name: "Null Domain Org",
      slug: "null-domain-org",
      domain: null,
      shouldAttachUsersByDomain: false,
      ownerId: "user-111",
    };

    (createSlug as jest.Mock).mockReturnValue("null-domain-org");
    (createOrganizationRepository as jest.Mock).mockResolvedValue(expectedOrg);

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith("Null Domain Org");
    expect(createOrganizationRepository).toHaveBeenCalledWith({
      userId: "user-111",
      name: "Null Domain Org",
      domain: null,
      slug: "null-domain-org",
      shouldAttachUsersByDomain: false,
    });
    expect(result).toEqual(expectedOrg);
  });

  it("should handle repository errors", async () => {
    // Arrange
    const input = {
      userId: "user-error",
      name: "Error Org",
    };

    const repositoryError = new Error("Repository error");
    (createSlug as jest.Mock).mockReturnValue("error-org");
    (createOrganizationRepository as jest.Mock).mockRejectedValue(
      repositoryError
    );

    // Act & Assert
    await expect(createOrganizationService(input)).rejects.toThrow(
      "Repository error"
    );

    expect(createSlug).toHaveBeenCalledWith("Error Org");
    expect(createOrganizationRepository).toHaveBeenCalledWith({
      userId: "user-error",
      name: "Error Org",
      domain: undefined,
      slug: "error-org",
      shouldAttachUsersByDomain: false,
    });
  });

  it("should handle slug creation errors", async () => {
    // Arrange
    const input = {
      userId: "user-slug-error",
      name: "Slug Error Org",
    };

    const slugError = new Error("Slug creation failed");
    (createSlug as jest.Mock).mockImplementation(() => {
      throw slugError;
    });

    // Act & Assert
    await expect(createOrganizationService(input)).rejects.toThrow(
      "Slug creation failed"
    );

    expect(createSlug).toHaveBeenCalledWith("Slug Error Org");
    expect(createOrganizationRepository).not.toHaveBeenCalled();
  });

  it("should handle special characters in organization name", async () => {
    // Arrange
    const input = {
      userId: "user-special",
      name: "Org with Special@#$ Characters!",
    };

    const expectedOrg = {
      ...mockOrganization,
      name: "Org with Special@#$ Characters!",
      slug: "org-with-special-characters",
    };

    (createSlug as jest.Mock).mockReturnValue("org-with-special-characters");
    (createOrganizationRepository as jest.Mock).mockResolvedValue(expectedOrg);

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith("Org with Special@#$ Characters!");
    expect(result.name).toBe("Org with Special@#$ Characters!");
    expect(result.slug).toBe("org-with-special-characters");
  });

  it("should handle long organization names", async () => {
    // Arrange
    const longName = "A".repeat(100);
    const input = {
      userId: "user-long",
      name: longName,
    };

    const expectedSlug = "a-".repeat(50).slice(0, -1); // Mock truncated slug
    const expectedOrg = {
      ...mockOrganization,
      name: longName,
      slug: expectedSlug,
    };

    (createSlug as jest.Mock).mockReturnValue(expectedSlug);
    (createOrganizationRepository as jest.Mock).mockResolvedValue(expectedOrg);

    // Act
    const result = await createOrganizationService(input);

    // Assert
    expect(createSlug).toHaveBeenCalledWith(longName);
    expect(result.name).toBe(longName);
  });
});
