jest.mock("@/services/membership/get-user-membership-organization");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/repositories/members/get-membership-by-user-id");
jest.mock("@/repositories/members/update-membership");
jest.mock("@/repositories/organizations/update-organization");
jest.mock("@repo/auth", () => ({
  organizationSchema: { parse: jest.fn() },
}));

import { prisma } from "@/infra/prisma/prisma-connection";
import { getMembershipByUserIdRepository } from "@/repositories/members/get-membership-by-user-id";
import { updateMembershipRepository } from "@/repositories/members/update-membership";
import { updateOrganizationRepository } from "@/repositories/organizations/update-organization";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { organizationSchema } from "@repo/auth";
import { transferOrganizationService } from "./transfer-organization.service";

describe("transferOrganizationService", () => {
  const userId = "user-1";
  const transferToUserId = "user-2";
  const slug = "org-slug";
  const organization = {
    id: "org-123",
    ownerId: userId,
    __typename: "Organization",
  };
  const membership = {
    role: "OWNER",
    userId,
    organizationId: organization.id,
  };
  const transferToMembership = {
    role: "MEMBER",
    userId: transferToUserId,
    organizationId: organization.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
      return cb({} as any);
    });
  });

  it("should transfer organization when user has permission and target is member", async () => {
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });
    (organizationSchema.parse as jest.Mock).mockReturnValue({
      id: organization.id,
      ownerId: organization.ownerId,
    });
    (getMembershipByUserIdRepository as jest.Mock).mockResolvedValue(
      transferToMembership
    );
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      await cb({});
      return "transaction-result";
    });
    (updateMembershipRepository as jest.Mock).mockResolvedValue(undefined);
    (updateOrganizationRepository as jest.Mock).mockResolvedValue(undefined);

    const result = await transferOrganizationService({
      slug,
      userId,
      transferToUserId,
    });
    expect(getUserMembershipOrganization).toHaveBeenCalledWith({
      userId,
      organizationSlug: slug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, membership.role);
    expect(organizationSchema.parse).toHaveBeenCalledWith({
      id: organization.id,
      ownerId: organization.ownerId,
    });
    expect(getMembershipByUserIdRepository).toHaveBeenCalledWith(
      transferToUserId,
      organization.id
    );
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toBe("transaction-result");
  });

  it("should throw ForbiddenError if user cannot transfer organization", async () => {
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(true),
    });
    (organizationSchema.parse as jest.Mock).mockReturnValue({
      id: organization.id,
      ownerId: organization.ownerId,
    });

    await expect(
      transferOrganizationService({ slug, userId, transferToUserId })
    ).rejects.toThrow(ForbiddenError);
    expect(getMembershipByUserIdRepository).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedError if target user is not a member", async () => {
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });
    (organizationSchema.parse as jest.Mock).mockReturnValue({
      id: organization.id,
      ownerId: organization.ownerId,
    });
    (getMembershipByUserIdRepository as jest.Mock).mockResolvedValue(undefined);

    await expect(
      transferOrganizationService({ slug, userId, transferToUserId })
    ).rejects.toThrow(UnauthorizedError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should propagate error from getUserMembershipOrganization", async () => {
    const error = new Error("Membership error");
    (getUserMembershipOrganization as jest.Mock).mockRejectedValue(error);
    await expect(
      transferOrganizationService({ slug, userId, transferToUserId })
    ).rejects.toThrow(error);
  });

  it("should propagate error from prisma.$transaction", async () => {
    (getUserMembershipOrganization as jest.Mock).mockResolvedValue({
      organization,
      membership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue({
      cannot: jest.fn().mockReturnValue(false),
    });
    (organizationSchema.parse as jest.Mock).mockReturnValue({
      id: organization.id,
      ownerId: organization.ownerId,
    });
    (getMembershipByUserIdRepository as jest.Mock).mockResolvedValue(
      transferToMembership
    );
    const error = new Error("Transaction error");
    (prisma.$transaction as jest.Mock).mockRejectedValue(error);

    await expect(
      transferOrganizationService({ slug, userId, transferToUserId })
    ).rejects.toThrow(error);
  });
});
