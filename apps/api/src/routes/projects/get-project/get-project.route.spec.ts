import { getProjectService } from "@/services/projects/get-project";
import { getProjectRoute } from "./get-project.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/projects/get-project");

describe("getProjectRoute", () => {
  const mockProject = {
    id: "project-1",
    name: "Test Project",
    description: "Test Description",
    slug: "test-project",
    avatarUrl: "avatar.jpg",
    organizationId: "org-1",
    ownerId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    owner: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      avatarUrl: "user-avatar.jpg",
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations/:organizationSlug/projects/:projectSlug", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getProjectRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:organizationSlug/projects/:projectSlug",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call getProjectService with correct parameters", async () => {
    // Arrange
    jest.mocked(getProjectService).mockResolvedValueOnce(mockProject);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        organizationSlug: "test-org",
        projectSlug: "test-project",
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
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
      projectSlug: "test-project",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Project retrieved successfully",
      data: {
        name: "Test Project",
        description: "Test Description",
        avatarUrl: "avatar.jpg",
        id: "project-1",
        slug: "test-project",
        ownerId: "user-1",
        organizationId: "org-1",
        owner: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          avatarUrl: "user-avatar.jpg",
        },
      },
    });
  });

  it("should handle null values correctly", async () => {
    // Arrange
    const projectWithNulls = {
      ...mockProject,
      name: null,
      description: null,
      avatarUrl: null,
      owner: {
        ...mockProject.owner,
        avatarUrl: null,
      },
    };
    jest.mocked(getProjectService).mockResolvedValueOnce(projectWithNulls);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        organizationSlug: "test-org",
        projectSlug: "test-project",
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
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Project retrieved successfully",
      data: {
        name: "",
        description: "",
        avatarUrl: "",
        id: "project-1",
        slug: "test-project",
        ownerId: "user-1",
        organizationId: "org-1",
        owner: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          avatarUrl: null,
        },
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Project not found");
    jest.mocked(getProjectService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        organizationSlug: "test-org",
        projectSlug: "test-project",
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
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getProjectRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Project not found"
    );
    expect(getProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "test-org",
      projectSlug: "test-project",
    });
  });

  it("should work with different organizations and projects", async () => {
    // Arrange
    const differentProject = {
      ...mockProject,
      id: "project-2",
      name: "Different Project",
      slug: "different-project",
    };
    jest.mocked(getProjectService).mockResolvedValueOnce(differentProject);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: {
        organizationSlug: "different-org",
        projectSlug: "different-project",
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
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getProjectService).toHaveBeenCalledWith({
      userId: "user-2",
      organizationSlug: "different-org",
      projectSlug: "different-project",
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Project retrieved successfully",
      data: expect.objectContaining({
        id: "project-2",
        name: "Different Project",
        slug: "different-project",
      }),
    });
  });
});
