import { amountOfMembersNotBillableRepository } from "@/repositories/members/amount-of-members-not-billable";
import { amountOfProjectsRepository } from "@/repositories/projects/amount-of-projects";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { getUserPermissions } from "@/services/authorization/user-permissions/get-user-permissions";
import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { getBillingInfoFromOrganizationService } from "./get-billing-info-from-organization.service";

// Mock dependencies
jest.mock("@/repositories/members/amount-of-members-not-billable");
jest.mock("@/repositories/projects/amount-of-projects");
jest.mock("@/services/authorization/user-permissions/get-user-permissions");
jest.mock("@/services/membership/get-user-membership-organization");

describe("getBillingInfoFromOrganizationService", () => {
  const userId = "user-123";
  const organizationSlug = "test-org";

  const mockOrganization = {
    id: "org-123",
    name: "Test Organization",
    slug: "test-org",
  };

  const mockMembership = {
    id: "membership-123",
    role: "ADMIN" as const,
    userId,
    organizationId: mockOrganization.id,
  };

  const mockPermissions = {
    can: jest.fn().mockReturnValue(true),
    cannot: jest.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate billing details correctly for ADMIN user", async () => {
    // Arrange
    const amountOfMembers = 2;
    const amountOfProjects = 3;

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: mockMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (amountOfMembersNotBillableRepository as jest.Mock).mockResolvedValue(
      amountOfMembers
    );
    (amountOfProjectsRepository as jest.Mock).mockResolvedValue(
      amountOfProjects
    );

    // Act
    const result = await getBillingInfoFromOrganizationService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      userId,
      organizationSlug,
    });
    expect(getUserPermissions).toHaveBeenCalledWith(userId, "ADMIN");
    expect(mockPermissions.cannot).toHaveBeenCalledWith("get", "Billing");
    expect(amountOfMembersNotBillableRepository).toHaveBeenCalledWith({
      organizationId: mockOrganization.id,
    });
    expect(amountOfProjectsRepository).toHaveBeenCalledWith({
      organizationId: mockOrganization.id,
    });

    expect(result).toEqual({
      billing: {
        seats: {
          amount: 2,
          unit: 10,
          price: 20, // 2 members * $10
        },
        projects: {
          amount: 3,
          unit: 20,
          price: 60, // 3 projects * $20
        },
        total: {
          amount: 80, // $20 + $60
          unit: "USD",
        },
      },
    });
  });

  it("should work for BILLING role user", async () => {
    // Arrange
    const billingMembership = { ...mockMembership, role: "BILLING" as const };
    const amountOfMembers = 1;
    const amountOfProjects = 2;

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: billingMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (amountOfMembersNotBillableRepository as jest.Mock).mockResolvedValue(
      amountOfMembers
    );
    (amountOfProjectsRepository as jest.Mock).mockResolvedValue(
      amountOfProjects
    );

    // Act
    const result = await getBillingInfoFromOrganizationService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(getUserPermissions).toHaveBeenCalledWith(userId, "BILLING");
    expect(result.billing.seats.amount).toBe(1);
    expect(result.billing.projects.amount).toBe(2);
  });

  it("should calculate correctly with zero members and projects", async () => {
    // Arrange
    const amountOfMembers = 0;
    const amountOfProjects = 0;

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: mockMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (amountOfMembersNotBillableRepository as jest.Mock).mockResolvedValue(
      amountOfMembers
    );
    (amountOfProjectsRepository as jest.Mock).mockResolvedValue(
      amountOfProjects
    );

    // Act
    const result = await getBillingInfoFromOrganizationService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(result).toEqual({
      billing: {
        seats: {
          amount: 0,
          unit: 10,
          price: 0, // 0 members * $10
        },
        projects: {
          amount: 0,
          unit: 20,
          price: 0, // 0 projects * $20
        },
        total: {
          amount: 0, // $0 + $0
          unit: "USD",
        },
      },
    });
  });

  it("should throw ForbiddenError when user has no permission", async () => {
    // Arrange
    const memberMembership = { ...mockMembership, role: "MEMBER" as const };
    const noPermissions = {
      can: jest.fn().mockReturnValue(false),
      cannot: jest.fn().mockReturnValue(true),
    };

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: memberMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(noPermissions);

    // Act & Assert
    await expect(
      getBillingInfoFromOrganizationService({ userId, organizationSlug })
    ).rejects.toThrow(
      new ForbiddenError(
        "User does not have permission to view billing details"
      )
    );

    expect(getUserPermissions).toHaveBeenCalledWith(userId, "MEMBER");
    expect(noPermissions.cannot).toHaveBeenCalledWith("get", "Billing");
    expect(amountOfMembersNotBillableRepository).not.toHaveBeenCalled();
    expect(amountOfProjectsRepository).not.toHaveBeenCalled();
  });

  it("should handle repository errors", async () => {
    // Arrange
    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: mockMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (amountOfMembersNotBillableRepository as jest.Mock).mockRejectedValue(
      new Error("Repository error")
    );

    // Act & Assert
    await expect(
      getBillingInfoFromOrganizationService({ userId, organizationSlug })
    ).rejects.toThrow("Repository error");
  });

  it("should handle Promise.all parallel execution correctly", async () => {
    // Arrange
    const amountOfMembers = 5;
    const amountOfProjects = 10;

    (getUserMembershipOrganizationService as jest.Mock).mockResolvedValue({
      organization: mockOrganization,
      membership: mockMembership,
    });
    (getUserPermissions as jest.Mock).mockReturnValue(mockPermissions);
    (amountOfMembersNotBillableRepository as jest.Mock).mockResolvedValue(
      amountOfMembers
    );
    (amountOfProjectsRepository as jest.Mock).mockResolvedValue(
      amountOfProjects
    );

    // Act
    const result = await getBillingInfoFromOrganizationService({
      userId,
      organizationSlug,
    });

    // Assert
    expect(amountOfMembersNotBillableRepository).toHaveBeenCalledWith({
      organizationId: mockOrganization.id,
    });
    expect(amountOfProjectsRepository).toHaveBeenCalledWith({
      organizationId: mockOrganization.id,
    });

    expect(result.billing.seats.price).toBe(50); // 5 * 10
    expect(result.billing.projects.price).toBe(200); // 10 * 20
    expect(result.billing.total.amount).toBe(250); // 50 + 200
  });
});
