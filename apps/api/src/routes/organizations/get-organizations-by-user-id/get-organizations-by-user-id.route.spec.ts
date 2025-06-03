import { getOrganizationsByUserIdService } from "@/services/organizations/get-organizations-by-user-id/get-organizations-by-user-id.service";
import { getOrganizationsByUserIdRoute } from "./get-organizations-by-user-id.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock(
  "@/services/organizations/get-organizations-by-user-id/get-organizations-by-user-id.service"
);

describe("getOrganizationsByUserIdRoute", () => {
  const mockOrganizations = [
    {
      id: "org-1",
      name: "Organization 1",
      slug: "org-1",
      domain: "org1.com",
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
    {
      id: "org-2",
      name: "Organization 2",
      slug: "org-2",
      domain: null,
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "user-2",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getOrganizationsByUserIdRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call getOrganizationsByUserIdService with correct parameters", async () => {
    // Arrange
    jest
      .mocked(getOrganizationsByUserIdService)
      .mockResolvedValueOnce(mockOrganizations);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
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

    await getOrganizationsByUserIdRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getOrganizationsByUserIdService).toHaveBeenCalledWith("user-1");
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organizations retrieved successfully",
      data: {
        organizations: mockOrganizations,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Failed to retrieve organizations");
    jest.mocked(getOrganizationsByUserIdService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
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

    await getOrganizationsByUserIdRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to retrieve organizations"
    );
    expect(getOrganizationsByUserIdService).toHaveBeenCalledWith("user-1");
  });

  it("should work with different user IDs", async () => {
    // Arrange
    jest
      .mocked(getOrganizationsByUserIdService)
      .mockResolvedValueOnce(mockOrganizations);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
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

    await getOrganizationsByUserIdRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getOrganizationsByUserIdService).toHaveBeenCalledWith("user-2");
  });

  it("should return empty array when no organizations found", async () => {
    // Arrange
    jest.mocked(getOrganizationsByUserIdService).mockResolvedValueOnce([]);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
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

    await getOrganizationsByUserIdRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organizations retrieved successfully",
      data: {
        organizations: [],
      },
    });
  });
});
