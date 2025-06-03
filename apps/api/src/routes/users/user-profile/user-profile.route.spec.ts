import { prisma } from "@/infra/prisma/prisma-connection";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { userProfileRoute } from "./user-profile.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("userProfileRoute", () => {
  const mockUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /users", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await userProfileRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/users",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should return user profile when user exists", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

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

    await userProfileRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      where: {
        id: "user-1",
      },
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      data: {
        user: mockUser,
      },
    });
  });

  it("should throw NotFoundError when user does not exist", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

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

    await userProfileRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      NotFoundError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User not found"
    );
  });

  it("should handle database errors", async () => {
    // Arrange
    const error = new Error("Database connection failed");
    jest.mocked(prisma.user.findUnique).mockRejectedValueOnce(error);

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

    await userProfileRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should work with different user IDs", async () => {
    // Arrange
    const differentUser = {
      ...mockUser,
      id: "user-2",
      name: "Jane Doe",
      email: "jane@example.com",
    };
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(differentUser);

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

    await userProfileRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      where: {
        id: "user-2",
      },
    });
    expect(mockReply.send).toHaveBeenCalledWith({
      data: {
        user: differentUser,
      },
    });
  });
});
