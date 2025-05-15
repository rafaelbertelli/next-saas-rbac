import { prisma } from "@/infra/prisma/prisma-connection";
import { getOrganizationByDomainRepository } from "./get-organization-by-domain.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getOrganizationByDomainRepository", () => {
  const domain = "org.com";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the organization when found", async () => {
    const mockOrganization = {
      id: "org-1",
      name: "Org Name",
      slug: "org-slug",
      domain,
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .mocked(prisma.organization.findUnique)
      .mockResolvedValueOnce(mockOrganization as any);

    const result = await getOrganizationByDomainRepository(domain);

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { domain },
    });
    expect(result).toBe(mockOrganization);
  });

  it("should return null when organization is not found", async () => {
    jest.mocked(prisma.organization.findUnique).mockResolvedValueOnce(null);

    const result = await getOrganizationByDomainRepository(domain);

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { domain },
    });
    expect(result).toBeNull();
  });

  it("should throw if prisma throws", async () => {
    jest
      .mocked(prisma.organization.findUnique)
      .mockRejectedValueOnce(new Error());

    await expect(getOrganizationByDomainRepository(domain)).rejects.toThrow(
      "Failed to get organization by domain"
    );
  });
});
