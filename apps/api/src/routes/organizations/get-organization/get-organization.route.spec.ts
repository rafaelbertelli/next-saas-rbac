import { getOrganizationBySlugService } from "@/services/organizations/get-organization-by-slug";
import { getOrganizationRoute } from "./get-organization.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/organizations/get-organization-by-slug");

describe("getOrganizationRoute", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Test Organization",
    slug: "test-org",
    domain: "test.com",
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations/:slug", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:slug",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call getOrganizationBySlugService with correct parameters", async () => {
    // Arrange
    jest
      .mocked(getOrganizationBySlugService)
      .mockResolvedValueOnce(mockOrganization);

    const mockRequest = {
      params: { slug: "test-org" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getOrganizationBySlugService).toHaveBeenCalledWith("test-org");
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organization retrieved successfully",
      data: {
        organization: mockOrganization,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Organization not found");
    jest.mocked(getOrganizationBySlugService).mockRejectedValueOnce(error);

    const mockRequest = {
      params: { slug: "test-org" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Organization not found"
    );
    expect(getOrganizationBySlugService).toHaveBeenCalledWith("test-org");
  });

  it("should work with different organization slugs", async () => {
    // Arrange
    const differentOrg = {
      ...mockOrganization,
      slug: "different-org",
      name: "Different Organization",
    };
    jest
      .mocked(getOrganizationBySlugService)
      .mockResolvedValueOnce(differentOrg);

    const mockRequest = {
      params: { slug: "different-org" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getOrganizationBySlugService).toHaveBeenCalledWith("different-org");
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organization retrieved successfully",
      data: {
        organization: differentOrg,
      },
    });
  });

  it("should return 200 status code on successful retrieval", async () => {
    // Arrange
    jest
      .mocked(getOrganizationBySlugService)
      .mockResolvedValueOnce(mockOrganization);

    const mockRequest = {
      params: { slug: "test-org" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });
});
