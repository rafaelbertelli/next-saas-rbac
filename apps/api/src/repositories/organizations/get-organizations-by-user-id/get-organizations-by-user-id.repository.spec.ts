import { prisma } from "@/infra/prisma/prisma-connection";
import { getOrganizationsByUserIdRepository } from "./get-organizations-by-user-id.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("getOrganizationsByUserIdRepository", () => {
  const userId = "user-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return organizations for the user", async () => {
    const mockOrganizationsFromPrisma = [
      {
        id: "org-1",
        name: "Org 1",
        slug: "org-1",
        domain: "org1.com",
        avatarUrl: null,
        members: [{ role: "ADMIN" }],
      },
      {
        id: "org-2",
        name: "Org 2",
        slug: "org-2",
        domain: "org2.com",
        avatarUrl: null,
        members: [{ role: "MEMBER" }],
      },
    ];
    (prisma.organization.findMany as jest.Mock).mockResolvedValueOnce(
      mockOrganizationsFromPrisma
    );

    const result = await getOrganizationsByUserIdRepository(userId);

    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        avatarUrl: true,
        members: {
          select: {
            role: true,
          },
          where: {
            userId,
          },
        },
      },
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    expect(result).toEqual([
      {
        id: "org-1",
        name: "Org 1",
        slug: "org-1",
        domain: "org1.com",
        avatarUrl: null,
        role: "ADMIN",
      },
      {
        id: "org-2",
        name: "Org 2",
        slug: "org-2",
        domain: "org2.com",
        avatarUrl: null,
        role: "MEMBER",
      },
    ]);
  });

  it("should return an empty array if user has no organizations", async () => {
    (prisma.organization.findMany as jest.Mock).mockResolvedValueOnce([]);

    const result = await getOrganizationsByUserIdRepository(userId);

    expect(result).toEqual([]);
  });

  it("should throw if prisma throws", async () => {
    (prisma.organization.findMany as jest.Mock).mockRejectedValueOnce(
      new Error()
    );

    await expect(getOrganizationsByUserIdRepository(userId)).rejects.toThrow(
      "Failed to get organizations"
    );
  });
});
