import { getOrganizationBySlugRepository } from "@/repositories/organizations/get-organization-by-slug/get-organization-by-slug";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getOrganizationBySlugService } from "./get-organization-by-slug.service";

jest.mock(
  "@/repositories/organizations/get-organization-by-slug/get-organization-by-slug"
);

describe("getOrganizationBySlugService", () => {
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
    (getOrganizationBySlugRepository as jest.Mock).mockResolvedValueOnce(
      mockOrganization
    );

    const result = await getOrganizationBySlugService(slug);

    expect(getOrganizationBySlugRepository).toHaveBeenCalledWith(slug);
    expect(result).toBe(mockOrganization);
  });

  it("should throw NotFoundError when organization is not found", async () => {
    (getOrganizationBySlugRepository as jest.Mock).mockResolvedValueOnce(null);

    await expect(getOrganizationBySlugService(slug)).rejects.toThrow(
      NotFoundError
    );
    await expect(getOrganizationBySlugService(slug)).rejects.toThrow(
      "Organization not found"
    );
  });
});
