import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getMembershipBySlugService } from "./get-membership-by-slug.service";

jest.mock("@/repositories/members/get-membership-by-slug.repository");

const mockedGetMembershipBySlugRepository = jest.mocked(
  getMembershipBySlugRepository
);

describe("getMembershipBySlugService", () => {
  const userId = "user-123";
  const organizationSlug = "org-slug";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the member when found", async () => {
    const mockMember = {
      id: "member-1",
      userId,
      organizationId: "org-1",
      role: "MEMBER",
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: {
        id: "org-1",
        name: "Org Name",
        slug: organizationSlug,
        domain: "org.com",
        avatarUrl: null,
        shouldAttachUsersByDomain: false,
        ownerId: "owner-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    mockedGetMembershipBySlugRepository.mockResolvedValueOnce(
      mockMember as any
    );

    const result = await getMembershipBySlugService({
      userId,
      organizationSlug,
    });

    expect(result).toBe(mockMember);
    expect(mockedGetMembershipBySlugRepository).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
  });

  it("should throw NotFoundError when member is not found", async () => {
    mockedGetMembershipBySlugRepository.mockResolvedValueOnce(null);

    await expect(
      getMembershipBySlugService({ userId, organizationSlug })
    ).rejects.toThrowError(NotFoundError);
    expect(mockedGetMembershipBySlugRepository).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
  });
});
