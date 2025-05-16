import { prisma } from "@/infra/prisma/prisma-connection";
import { deleteOrganizationRepository } from "./delete-organization.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("deleteOrganizationRepository", () => {
  const baseOrg = {
    id: "org-1",
    name: "Org Name",
    slug: "org-slug",
    domain: "org.com",
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "owner-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete and return the organization", async () => {
    jest.mocked(prisma.organization.delete).mockResolvedValueOnce(baseOrg);
    const result = await deleteOrganizationRepository({
      organizationId: baseOrg.id,
    });
    expect(prisma.organization.delete).toHaveBeenCalledWith({
      where: { id: baseOrg.id },
    });
    expect(result).toBe(baseOrg);
  });

  it("should throw an error if prisma throws", async () => {
    jest
      .mocked(prisma.organization.delete)
      .mockRejectedValueOnce(new Error("DB error"));
    await expect(
      deleteOrganizationRepository({ organizationId: baseOrg.id })
    ).rejects.toThrow("Error deleting organization");
  });
});
