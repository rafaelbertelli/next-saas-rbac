import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipBySlugRepository } from "./get-membership-by-slug.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getMembershipBySlugRepository", () => {
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
      role: Role.MEMBER,
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: { slug: organizationSlug },
    };
    jest.mocked(prisma.member.findFirst).mockResolvedValueOnce(mockMember);

    const result = await getMembershipBySlugRepository({
      userId,
      organizationSlug,
    });

    expect(prisma.member.findFirst).toHaveBeenCalledWith({
      where: {
        userId,
        organization: { slug: organizationSlug },
      },
      include: { organization: true },
    });
    expect(result).toBe(mockMember);
  });

  it("should return null when member is not found", async () => {
    jest.mocked(prisma.member.findFirst).mockResolvedValueOnce(null);

    const result = await getMembershipBySlugRepository({
      userId,
      organizationSlug,
    });

    expect(result).toBeNull();
  });

  it("should throw if prisma throws", async () => {
    jest.mocked(prisma.member.findFirst).mockRejectedValueOnce(new Error());

    await expect(
      getMembershipBySlugRepository({ userId, organizationSlug })
    ).rejects.toThrow("Failed to get membership by slug");
  });
});
