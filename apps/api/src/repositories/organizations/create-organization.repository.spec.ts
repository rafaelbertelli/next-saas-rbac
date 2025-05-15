import { prisma } from "@/infra/prisma/prisma-connection";
import { createOrganizationRepository } from "./create-organization.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    organization: {
      create: jest.fn(),
    },
  },
}));

describe("createOrganizationRepository", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Acme Inc",
    domain: "acme.com",
    slug: "acme-inc",
    shouldAttachUsersByDomain: true,
    ownerId: "user-1",
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an organization and return it", async () => {
    // Arrange
    (prisma.organization.create as jest.Mock).mockResolvedValue(
      mockOrganization
    );
    const input = {
      userId: "user-1",
      name: "Acme Inc",
      domain: "acme.com",
      slug: "acme-inc",
      shouldAttachUsersByDomain: true,
    };

    // Act
    const result = await createOrganizationRepository(input);

    // Assert
    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        domain: input.domain,
        slug: input.slug,
        shouldAttachUsersByDomain: input.shouldAttachUsersByDomain,
        ownerId: input.userId,
        members: {
          create: {
            userId: input.userId,
            role: "ADMIN",
          },
        },
      },
    });
    expect(result).toEqual(mockOrganization);
  });

  it("should throw if prisma throws", async () => {
    jest.mocked(prisma.organization.create).mockRejectedValueOnce(new Error());

    await expect(createOrganizationRepository({} as any)).rejects.toThrow(
      "Failed to create organization"
    );
  });
});
