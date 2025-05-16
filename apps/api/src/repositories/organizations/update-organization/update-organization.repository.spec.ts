import { prisma } from "@/infra/prisma/prisma-connection";
import { updateOrganizationRepository } from "./update-organization.repository";

jest.mock("@/infra/prisma/prisma-connection");

describe("updateOrganizationRepository", () => {
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

  it("should update and return the organization with all fields", async () => {
    const updated = {
      ...baseOrg,
      name: "New Name",
      domain: "new.com",
      shouldAttachUsersByDomain: true,
    };
    jest.mocked(prisma.organization.update).mockResolvedValueOnce(updated);

    const result = await updateOrganizationRepository({
      organizationId: baseOrg.id,
      name: "New Name",
      domain: "new.com",
      shouldAttachUsersByDomain: true,
    });

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: baseOrg.id },
      data: {
        name: "New Name",
        domain: "new.com",
        shouldAttachUsersByDomain: true,
      },
    });
    expect(result).toBe(updated);
  });

  it("should update and return the organization with partial fields", async () => {
    const updated = { ...baseOrg, name: "Partial Name" };
    jest.mocked(prisma.organization.update).mockResolvedValueOnce(updated);

    const result = await updateOrganizationRepository({
      organizationId: baseOrg.id,
      name: "Partial Name",
    });

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: baseOrg.id },
      data: { name: "Partial Name" },
    });
    expect(result).toBe(updated);
  });

  it("should throw an error if prisma throws", async () => {
    jest
      .mocked(prisma.organization.update)
      .mockRejectedValueOnce(new Error("DB error"));

    await expect(
      updateOrganizationRepository({ organizationId: baseOrg.id, name: "fail" })
    ).rejects.toThrow("Error updating organization");
  });
});
