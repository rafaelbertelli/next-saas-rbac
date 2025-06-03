import { createProjectService } from "@/services/projects/create-project/create-project.service";
import { createProjectRoute } from "./create-project.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/projects/create-project/create-project.service");

describe("createProjectRoute", () => {
  const mockProject = {
    id: "project-1",
    name: "Test Project",
    description: "Test Description",
    slug: "test-project",
    avatarUrl: null,
    organizationId: "org-1",
    ownerId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /organizations/:slug/projects", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await createProjectRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/organizations/:slug/projects",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call createProjectService with correct parameters", async () => {
    // Arrange
    jest.mocked(createProjectService).mockResolvedValueOnce(mockProject);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Test Project",
        description: "Test Description",
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

    await createProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      slug: "test-org",
      name: "Test Project",
      description: "Test Description",
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Project created successfully",
      data: { projectId: mockProject.id },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Failed to create project");
    jest.mocked(createProjectService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Test Project",
        description: "Test Description",
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

    await createProjectRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to create project"
    );
    expect(createProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      slug: "test-org",
      name: "Test Project",
      description: "Test Description",
    });
  });

  it("should work with different organizations and project data", async () => {
    // Arrange
    const differentProject = {
      ...mockProject,
      id: "project-2",
      name: "Different Project",
      description: "Different Description",
    };
    jest.mocked(createProjectService).mockResolvedValueOnce(differentProject);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: { slug: "different-org" },
      body: {
        name: "Different Project",
        description: "Different Description",
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

    await createProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createProjectService).toHaveBeenCalledWith({
      userId: "user-2",
      slug: "different-org",
      name: "Different Project",
      description: "Different Description",
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Project created successfully",
      data: { projectId: "project-2" },
    });
  });

  it("should return 201 status code on successful creation", async () => {
    // Arrange
    jest.mocked(createProjectService).mockResolvedValueOnce(mockProject);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { slug: "test-org" },
      body: {
        name: "Test Project",
        description: "Test Description",
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

    await createProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(201);
  });
});
