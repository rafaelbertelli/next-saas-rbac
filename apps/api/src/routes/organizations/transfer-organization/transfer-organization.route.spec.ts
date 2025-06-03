import { transferOrganizationService } from "@/services/organizations/transfer-organization/transfer-organization.service";
import { transferOrganizationRoute } from "./transfer-organization.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock(
  "@/services/organizations/transfer-organization/transfer-organization.service"
);

// Mock console.log to avoid output during tests
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("transferOrganizationRoute", () => {
  const mockTransferData = {
    organizationId: "org-1",
    transferToUserId: "user-2",
    message: "Organization transferred successfully",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("should register PATCH route for /organizations/:slug/owner", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      patch: jest.fn(),
    };

    // Act
    await transferOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.patch).toHaveBeenCalledWith(
      "/organizations/:slug/owner",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should transfer organization ownership successfully", async () => {
    // Arrange
    jest
      .mocked(transferOrganizationService)
      .mockResolvedValueOnce(mockTransferData as never);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
      },
      body: {
        transferToUserId: "user-2",
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
      patch: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await transferOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(transferOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-1",
      transferToUserId: "user-2",
    });
    expect(console.log).toHaveBeenCalledWith(mockTransferData);
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("User not authorized to transfer organization");
    jest.mocked(transferOrganizationService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
      },
      body: {
        transferToUserId: "user-2",
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
      patch: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await transferOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User not authorized to transfer organization"
    );
    expect(transferOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-1",
      transferToUserId: "user-2",
    });
  });

  it("should work with different organization slugs", async () => {
    // Arrange
    jest
      .mocked(transferOrganizationService)
      .mockResolvedValueOnce(mockTransferData as never);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "different-org",
      },
      body: {
        transferToUserId: "user-3",
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
      patch: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await transferOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(transferOrganizationService).toHaveBeenCalledWith({
      slug: "different-org",
      userId: "user-1",
      transferToUserId: "user-3",
    });
  });

  it("should work with different current user IDs", async () => {
    // Arrange
    jest
      .mocked(transferOrganizationService)
      .mockResolvedValueOnce(mockTransferData as never);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-5"),
      params: {
        slug: "test-org",
      },
      body: {
        transferToUserId: "user-2",
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
      patch: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await transferOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(transferOrganizationService).toHaveBeenCalledWith({
      slug: "test-org",
      userId: "user-5",
      transferToUserId: "user-2",
    });
  });

  it("should return 204 No Content on successful transfer", async () => {
    // Arrange
    jest
      .mocked(transferOrganizationService)
      .mockResolvedValueOnce(mockTransferData as never);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
      },
      body: {
        transferToUserId: "user-2",
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
      patch: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await transferOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });
});
