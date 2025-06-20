import { getOrganizationByDomainRepository } from "@/repositories/organizations/get-organization-by-domain";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { checkDuplicateOrganizationService } from "./check-duplicate-organization.service";

// Mock dependencies
jest.mock("@/repositories/organizations/get-organization-by-domain");

describe("checkDuplicateOrganizationService", () => {
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

  it("should return null when domain is not taken", async () => {
    // Arrange
    const domain = "available-domain.com";
    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await checkDuplicateOrganizationService(domain);

    // Assert
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
    expect(result).toBeNull();
  });

  it("should throw ConflictError when domain is already taken", async () => {
    // Arrange
    const domain = "taken-domain.com";
    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(
      mockOrganization
    );

    // Act & Assert
    await expect(checkDuplicateOrganizationService(domain)).rejects.toThrow(
      new ConflictError("Organization already exists")
    );

    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
  });

  it("should handle different domain formats", async () => {
    // Arrange
    const domains = [
      "simple.com",
      "sub.domain.com",
      "complex-domain-name.org",
      "123-numbers.net",
      "UPPERCASE.COM",
    ];

    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    for (const domain of domains) {
      const result = await checkDuplicateOrganizationService(domain);
      expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
      expect(result).toBeNull();
    }

    expect(getOrganizationByDomainRepository).toHaveBeenCalledTimes(
      domains.length
    );
  });

  it("should throw ConflictError for any existing organization regardless of other properties", async () => {
    // Arrange
    const domain = "existing.com";
    const differentOrganization = {
      ...mockOrganization,
      id: "org-456",
      name: "Different Organization",
      slug: "different-organization",
      ownerId: "user-456",
    };

    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(
      differentOrganization
    );

    // Act & Assert
    await expect(checkDuplicateOrganizationService(domain)).rejects.toThrow(
      new ConflictError("Organization already exists")
    );

    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
  });

  it("should handle repository errors", async () => {
    // Arrange
    const domain = "error-domain.com";
    const repositoryError = new Error("Database connection failed");
    (getOrganizationByDomainRepository as jest.Mock).mockRejectedValue(
      repositoryError
    );

    // Act & Assert
    await expect(checkDuplicateOrganizationService(domain)).rejects.toThrow(
      "Database connection failed"
    );

    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
  });

  it("should handle empty string domain", async () => {
    // Arrange
    const domain = "";
    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await checkDuplicateOrganizationService(domain);

    // Assert
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith("");
    expect(result).toBeNull();
  });

  it("should handle domain with special characters", async () => {
    // Arrange
    const domain = "special-chars_123.co.uk";
    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await checkDuplicateOrganizationService(domain);

    // Assert
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
    expect(result).toBeNull();
  });

  it("should handle very long domain names", async () => {
    // Arrange
    const longDomain = "a".repeat(60) + ".com"; // Max domain length is typically 253 chars
    (getOrganizationByDomainRepository as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await checkDuplicateOrganizationService(longDomain);

    // Assert
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(longDomain);
    expect(result).toBeNull();
  });

  it("should be case sensitive when checking domains", async () => {
    // Arrange
    const lowerCaseDomain = "test.com";
    const upperCaseDomain = "TEST.COM";

    (getOrganizationByDomainRepository as jest.Mock)
      .mockResolvedValueOnce(null) // for lowercase
      .mockResolvedValueOnce(mockOrganization); // for uppercase

    // Act
    const resultLower =
      await checkDuplicateOrganizationService(lowerCaseDomain);

    // Assert first call
    expect(resultLower).toBeNull();

    // Act & Assert second call
    await expect(
      checkDuplicateOrganizationService(upperCaseDomain)
    ).rejects.toThrow(new ConflictError("Organization already exists"));

    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(
      lowerCaseDomain
    );
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(
      upperCaseDomain
    );
  });

  it("should handle timeout errors from repository", async () => {
    // Arrange
    const domain = "timeout-domain.com";
    const timeoutError = new Error("Query timeout");
    (getOrganizationByDomainRepository as jest.Mock).mockRejectedValue(
      timeoutError
    );

    // Act & Assert
    await expect(checkDuplicateOrganizationService(domain)).rejects.toThrow(
      "Query timeout"
    );
    expect(getOrganizationByDomainRepository).toHaveBeenCalledWith(domain);
  });
});
