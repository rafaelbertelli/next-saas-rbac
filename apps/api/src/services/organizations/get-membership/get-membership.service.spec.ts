import { getMembershipBySlugRepository } from "@/repositories/members/get-membership-by-slug.repository";

import { getCurrentUserId } from "@/services/users/get-current-user-id";
import { FastifyRequest } from "fastify";
import { getMembership } from "./get-membership.service";

jest.mock("@/services/users/get-current-user-id");
jest.mock("@/repositories/members/get-membership-by-slug.repository");

describe("getMembership", () => {
  it("should return the user membership", async () => {
    // Arrange
    const mockUserId = "user-123";
    const mockOrganization = {
      id: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Org Test",
      slug: "org-test",
      domain: "org.com",
      avatarUrl: "avatar.png",
      shouldAttachUsersByDomain: true,
      ownerId: "owner-1",
    };
    const mockMembership = {
      id: "mem-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "admin",
      userId: mockUserId,
      organizationId: mockOrganization.id,
    };

    (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue({
      ...mockMembership,
      organization: mockOrganization,
    });

    const request = {} as FastifyRequest;

    // Act
    const result = await getMembership(request, "org-test");

    // Assert
    expect(result).toEqual({
      organization: mockOrganization,
      membership: mockMembership,
    });
  });

  it("should throw an error if getCurrentUserId throws", async () => {
    // Arrange
    (getCurrentUserId as jest.Mock).mockRejectedValue(
      new Error("Invalid token")
    );
    const request = {} as FastifyRequest;

    // Act & Assert
    await expect(getMembership(request, "org-test")).rejects.toThrow(
      "Invalid token"
    );
  });

  it("should throw an error if user is not a member of the organization", async () => {
    // Arrange
    const mockUserId = "user-123";
    (getCurrentUserId as jest.Mock).mockResolvedValue(mockUserId);
    (getMembershipBySlugRepository as jest.Mock).mockResolvedValue(undefined);
    const request = {} as FastifyRequest;

    // Act & Assert
    await expect(getMembership(request, "org-test")).rejects.toThrow(
      "You are not a member of this organization"
    );
  });
});
