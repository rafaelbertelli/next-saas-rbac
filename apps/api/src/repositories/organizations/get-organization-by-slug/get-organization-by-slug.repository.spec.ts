import { prisma } from "@/infra/prisma/prisma-connection";
import { getOrganizationBySlugRepository } from "./";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getOrganizationBySlugRepository", () => {
  const slug = "org-slug";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the organization when found", async () => {
    const mockOrganization = {
      id: "org-1",
      name: "Org Name",
      slug,
      domain: "org.com",
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest
      .mocked(prisma.organization.findUnique)
      .mockResolvedValueOnce(mockOrganization as any);

    const result = await getOrganizationBySlugRepository(slug);

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { slug },
    });
    expect(result).toBe(mockOrganization);
  });

  it("should return null when organization is not found", async () => {
    jest.mocked(prisma.organization.findUnique).mockResolvedValueOnce(null);

    const result = await getOrganizationBySlugRepository(slug);

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { slug },
    });
    expect(result).toBeNull();
  });

  it("should throw if prisma throws", async () => {
    jest
      .mocked(prisma.organization.findUnique)
      .mockRejectedValueOnce(new Error());

    await expect(getOrganizationBySlugRepository(slug)).rejects.toThrow(
      "Failed to get organization by slug"
    );
  });
});
