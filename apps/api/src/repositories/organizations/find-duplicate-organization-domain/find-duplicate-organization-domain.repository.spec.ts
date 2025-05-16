import { prisma } from "@/infra/prisma/prisma-connection";
import { findDuplicateOrganizationDomainRepository } from "./find-duplicate-organization-domain.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("findDuplicateOrganizationDomainRepository", () => {
  const domain = "example.com";
  const organizationSlug = "org-slug";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the organization when a duplicate is found", async () => {
    const mockOrganization = {
      id: "org-2",
      name: "Org 2",
      slug: "other-slug",
      domain,
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .mocked(prisma.organization.findFirst)
      .mockResolvedValueOnce(mockOrganization);

    const result = await findDuplicateOrganizationDomainRepository(
      domain,
      organizationSlug
    );

    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        domain,
        slug: {
          not: organizationSlug,
        },
      },
    });
    expect(result).toBe(mockOrganization);
  });

  it("should return null when no duplicate is found", async () => {
    jest.mocked(prisma.organization.findFirst).mockResolvedValueOnce(null);

    const result = await findDuplicateOrganizationDomainRepository(
      domain,
      organizationSlug
    );

    expect(result).toBeNull();
  });

  it("should throw an error if prisma throws", async () => {
    jest
      .mocked(prisma.organization.findFirst)
      .mockRejectedValueOnce(new Error("DB error"));

    await expect(
      findDuplicateOrganizationDomainRepository(domain, organizationSlug)
    ).rejects.toThrow("Error finding duplicate organization domain");
  });
});
