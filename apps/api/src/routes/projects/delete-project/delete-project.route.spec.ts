import { deleteProjectService } from "@/services/projects/delete-project";
import { deleteProjectRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/projects/delete-project");

describe("deleteProjectRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register DELETE route for /organizations/:slug/projects/:projectId", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn(),
    };

    // Act
    await deleteProjectRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.delete).toHaveBeenCalledWith(
      "/organizations/:slug/projects/:projectId",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call deleteProjectService with correct parameters", async () => {
    // Arrange
    jest.mocked(deleteProjectService).mockResolvedValueOnce(undefined);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
        projectId: "project-1",
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

    await deleteProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(deleteProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      slug: "test-org",
      projectId: "project-1",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Project not found");
    jest.mocked(deleteProjectService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
        projectId: "project-1",
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

    await deleteProjectRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Project not found"
    );
    expect(deleteProjectService).toHaveBeenCalledWith({
      userId: "user-1",
      slug: "test-org",
      projectId: "project-1",
    });
  });

  it("should work with different organizations and projects", async () => {
    // Arrange
    jest.mocked(deleteProjectService).mockResolvedValueOnce(undefined);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: {
        slug: "different-org",
        projectId: "project-2",
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

    await deleteProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(deleteProjectService).toHaveBeenCalledWith({
      userId: "user-2",
      slug: "different-org",
      projectId: "project-2",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should return 204 No Content on successful deletion", async () => {
    // Arrange
    jest.mocked(deleteProjectService).mockResolvedValueOnce(undefined);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: {
        slug: "test-org",
        projectId: "project-1",
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

    await deleteProjectRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });
});
