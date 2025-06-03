import { getProjectsService } from "@/services/projects/get-projects";
import { getProjectsRoute } from "./get-projects.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/projects/get-projects");

describe("getProjectsRoute", () => {
  const mockProjects = [
    {
      id: "project-1",
      name: "Project 1",
      description: "Description 1",
      slug: "project-1",
      avatarUrl: null,
      organizationId: "org-1",
      ownerId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      owner: {
        id: "user-1",
        name: "User 1",
        email: "user1@example.com",
        avatarUrl: null,
      },
    },
    {
      id: "project-2",
      name: "Project 2",
      description: "Description 2",
      slug: "project-2",
      avatarUrl: null,
      organizationId: "org-1",
      ownerId: "user-2",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      owner: {
        id: "user-2",
        name: "User 2",
        email: "user2@example.com",
        avatarUrl: null,
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations/:organizationSlug/projects", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getProjectsRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:organizationSlug/projects",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call getProjectsService with correct parameters", async () => {
    // Arrange
    jest.mocked(getProjectsService).mockResolvedValueOnce(mockProjects);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "test-org" },
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

    await getProjectsRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getProjectsService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Projects retrieved successfully",
      data: {
        projects: mockProjects,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Failed to retrieve projects");
    jest.mocked(getProjectsService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "test-org" },
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

    await getProjectsRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to retrieve projects"
    );
    expect(getProjectsService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
    });
  });

  it("should return empty array when no projects found", async () => {
    // Arrange
    jest.mocked(getProjectsService).mockResolvedValueOnce([]);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "test-org" },
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

    await getProjectsRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Projects retrieved successfully",
      data: {
        projects: [],
      },
    });
  });
});
