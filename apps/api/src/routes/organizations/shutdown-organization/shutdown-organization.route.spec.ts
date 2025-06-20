import { shutdownOrganizationService } from "@/services/organizations/shutdown-organization/shutdown-organization.service";
import { shutdownOrganizationRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock(
  "@/services/organizations/shutdown-organization/shutdown-organization.service"
);

// Mock console.log to avoid output during tests
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("shutdownOrganizationRoute", () => {
  const mockShutdownData = {
    organizationId: "org-1",
    message: "Organization shutdown successfully",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("should register DELETE route for /organizations/:slug", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn(),
    };

    // Act
    await shutdownOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.delete).toHaveBeenCalledWith(
      "/organizations/:slug",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should shutdown organization successfully", async () => {
    // Arrange
    jest
      .mocked(shutdownOrganizationService)
      .mockResolvedValueOnce(undefined as any);

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
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await shutdownOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(shutdownOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-1",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("User not authorized to shutdown organization");
    jest.mocked(shutdownOrganizationService).mockRejectedValueOnce(error);

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
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await shutdownOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User not authorized to shutdown organization"
    );
    expect(shutdownOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-1",
    });
  });

  it("should work with different organization slugs", async () => {
    // Arrange
    jest
      .mocked(shutdownOrganizationService)
      .mockResolvedValueOnce(undefined as any);

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
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await shutdownOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(shutdownOrganizationService).toHaveBeenCalledWith({
      slug: "different-org",
      userId: "user-1",
    });
  });

  it("should work with different user IDs", async () => {
    // Arrange
    jest
      .mocked(shutdownOrganizationService)
      .mockResolvedValueOnce(undefined as any);

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
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await shutdownOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(shutdownOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-2",
    });
  });

  it("should return 204 No Content on successful shutdown", async () => {
    // Arrange
    jest
      .mocked(shutdownOrganizationService)
      .mockResolvedValueOnce(undefined as any);

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
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await shutdownOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });
});
