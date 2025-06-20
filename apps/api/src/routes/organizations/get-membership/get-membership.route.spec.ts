import { getUserMembershipOrganizationService } from "@/services/membership/get-user-membership-organization";
import { getMembershipRoute } from "./get-membership.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/membership/get-user-membership-organization");

describe("getMembershipRoute", () => {
  const mockMembership = {
    id: "membership-1",
    organizationId: "org-1",
    userId: "user-1",
    role: "MEMBER" as const,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockOrganization = {
    id: "org-1",
    name: "Test Organization",
    slug: "test-org",
    domain: "test.com",
    shouldAttachUsersByDomain: false,
    avatarUrl: null,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations/:slug/membership", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getMembershipRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:slug/membership",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should return membership and organization data for valid user", async () => {
    // Arrange
    jest.mocked(getUserMembershipOrganizationService).mockResolvedValueOnce({
      membership: mockMembership,
      organization: mockOrganization,
    });

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getMembershipRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      organizationSlug: "test-org",
      userId: "user-1",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Membership retrieved successfully",
      data: {
        membership: mockMembership,
        organization: mockOrganization,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Organization not found");
    jest
      .mocked(getUserMembershipOrganizationService)
      .mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "nonexistent-org",
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getMembershipRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Organization not found"
    );
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      organizationSlug: "nonexistent-org",
      userId: "user-1",
    });
  });

  it("should work with different organization slugs", async () => {
    // Arrange
    const differentOrg = { ...mockOrganization, slug: "different-org" };
    jest.mocked(getUserMembershipOrganizationService).mockResolvedValueOnce({
      membership: mockMembership,
      organization: differentOrg,
    });

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "different-org",
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getMembershipRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      organizationSlug: "different-org",
      userId: "user-1",
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Membership retrieved successfully",
      data: {
        membership: mockMembership,
        organization: differentOrg,
      },
    });
  });

  it("should work with different user IDs", async () => {
    // Arrange
    jest.mocked(getUserMembershipOrganizationService).mockResolvedValueOnce({
      membership: mockMembership,
      organization: mockOrganization,
    });

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: {
        slug: "test-org",
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getMembershipRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getUserMembershipOrganizationService).toHaveBeenCalledWith({
      organizationSlug: "test-org",
      userId: "user-2",
    });
  });
});
