import { checkDuplicateOrganizationService } from "@/services/organizations/check-duplicate-organization";
import { createOrganizationService } from "@/services/organizations/create-organization";
import { createOrganizationRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/organizations/check-duplicate-organization");
jest.mock("@/services/organizations/create-organization");

describe("createOrganizationRoute", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Test Organization",
    slug: "test-organization",
    domain: "test.com",
    avatarUrl: null,
    shouldAttachUsersByDomain: false,
    ownerId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /organizations", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await createOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/organizations",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should create organization without domain", async () => {
    // Arrange
    jest
      .mocked(createOrganizationService)
      .mockResolvedValueOnce(mockOrganization);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      body: {
        name: "Test Organization",
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
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await createOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(checkDuplicateOrganizationService).not.toHaveBeenCalled();
    expect(createOrganizationService).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Test Organization",
      domain: null,
      shouldAttachUsersByDomain: false,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organization created successfully",
      data: {
        organizationId: mockOrganization.id,
      },
    });
  });

  it("should create organization with domain after checking for duplicates", async () => {
    // Arrange
    jest.mocked(checkDuplicateOrganizationService).mockResolvedValueOnce(null);
    jest
      .mocked(createOrganizationService)
      .mockResolvedValueOnce(mockOrganization);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
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
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await createOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(checkDuplicateOrganizationService).toHaveBeenCalledWith("test.com");
    expect(createOrganizationService).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Test Organization",
      domain: "test.com",
      shouldAttachUsersByDomain: true,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
  });

  it("should handle duplicate domain error", async () => {
    // Arrange
    const error = new Error("Domain already exists");
    jest.mocked(checkDuplicateOrganizationService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      body: {
        name: "Test Organization",
        domain: "existing.com",
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
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await createOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Domain already exists"
    );
    expect(checkDuplicateOrganizationService).toHaveBeenCalledWith(
      "existing.com"
    );
    expect(createOrganizationService).not.toHaveBeenCalled();
  });

  it("should handle create organization service error", async () => {
    // Arrange
    const error = new Error("Failed to create organization");
    jest.mocked(createOrganizationService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      body: {
        name: "Test Organization",
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
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await createOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to create organization"
    );
    expect(createOrganizationService).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Test Organization",
      domain: null,
      shouldAttachUsersByDomain: false,
    });
  });

  it("should work with different user and organization data", async () => {
    // Arrange
    const differentOrg = {
      ...mockOrganization,
      id: "org-2",
      name: "Different Org",
      ownerId: "user-2",
    };
    jest.mocked(createOrganizationService).mockResolvedValueOnce(differentOrg);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      body: {
        name: "Different Org",
        domain: undefined,
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
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await createOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createOrganizationService).toHaveBeenCalledWith({
      userId: "user-2",
      name: "Different Org",
      domain: undefined,
      shouldAttachUsersByDomain: true,
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Organization created successfully",
      data: {
        organizationId: "org-2",
      },
    });
  });
});
