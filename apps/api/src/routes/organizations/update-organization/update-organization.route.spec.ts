import { updateOrganizationService } from "@/services/organizations/update-organization";
import { updateOrganizationRoute } from "./update-organization.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/organizations/update-organization");

describe("updateOrganizationRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register PUT route for /organizations/:slug", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn(),
    };

    // Act
    await updateOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.put).toHaveBeenCalledWith(
      "/organizations/:slug",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call updateOrganizationService with correct parameters", async () => {
    // Arrange
    const mockUpdatedOrganization = {
      id: "org-1",
      name: "Updated Organization",
      slug: "test-org",
      domain: "updated.com",
      avatarUrl: null,
      shouldAttachUsersByDomain: true,
      ownerId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest
      .mocked(updateOrganizationService)
      .mockResolvedValueOnce(mockUpdatedOrganization);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Updated Organization",
        domain: "updated.com",
        shouldAttachUsersByDomain: true,
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
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(updateOrganizationService).toHaveBeenCalledWith({
      name: "Updated Organization",
      domain: "updated.com",
      slug: "test-org",
      shouldAttachUsersByDomain: true,
      userId: "user-1",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Update failed");
    jest.mocked(updateOrganizationService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Updated Organization",
        domain: null,
        shouldAttachUsersByDomain: false,
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
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Update failed"
    );
    expect(updateOrganizationService).toHaveBeenCalledWith({
      name: "Updated Organization",
      domain: null,
      slug: "test-org",
      shouldAttachUsersByDomain: false,
      userId: "user-1",
    });
  });

  it("should work with different organization data", async () => {
    // Arrange
    const mockUpdatedOrganization = {
      id: "org-2",
      name: "Different Name",
      slug: "different-org",
      domain: null,
      avatarUrl: null,
      shouldAttachUsersByDomain: false,
      ownerId: "user-2",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest
      .mocked(updateOrganizationService)
      .mockResolvedValueOnce(mockUpdatedOrganization);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: { slug: "different-org" },
      body: {
        name: "Different Name",
        domain: null,
        shouldAttachUsersByDomain: false,
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
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(updateOrganizationService).toHaveBeenCalledWith({
      name: "Different Name",
      domain: null,
      slug: "different-org",
      shouldAttachUsersByDomain: false,
      userId: "user-2",
    });
  });

  it("should return 204 No Content on successful update", async () => {
    // Arrange
    const mockUpdatedOrganization = {
      id: "org-1",
      name: "Test Organization",
      slug: "test-org",
      domain: "test.com",
      avatarUrl: null,
      shouldAttachUsersByDomain: true,
      ownerId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest
      .mocked(updateOrganizationService)
      .mockResolvedValueOnce(mockUpdatedOrganization);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Test Organization",
        domain: "test.com",
        shouldAttachUsersByDomain: true,
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
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });
});
