import { prisma } from "@/infra/prisma/prisma-connection";
import { passwordRecoverRoute } from ".";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    token: {
      create: jest.fn(),
    },
  },
}));

// Mock console.log to avoid output during tests
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("passwordRecoverRoute", () => {
  const mockUser = {
    id: "user-1",
    email: "john@example.com",
    name: "John Doe",
    passwordHash: "$2a$10$hashedpassword",
    avatarUrl: null,
    githubId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockToken = {
    id: "token-1",
    userId: "user-1",
    type: "PASSWORD_RECOVER",
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it("should register POST route for /session/password-recover", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await passwordRecoverRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/session/password-recover",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should create recovery token when user exists", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(prisma.token.create).mockResolvedValueOnce(mockToken);

    const mockRequest = {
      body: {
        email: "john@example.com",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await passwordRecoverRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "PASSWORD_RECOVER",
        expiresAt: expect.any(Date),
      },
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should return 204 even when user does not exist", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const mockRequest = {
      body: {
        email: "nonexistent@example.com",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await passwordRecoverRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });
    expect(prisma.token.create).not.toHaveBeenCalled();
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "User not found",
      email: "nonexistent@example.com",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle database errors during user lookup", async () => {
    // Arrange
    const error = new Error("Database connection failed");
    jest.mocked(prisma.user.findUnique).mockRejectedValueOnce(error);

    const mockRequest = {
      body: {
        email: "john@example.com",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await passwordRecoverRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should handle database errors during token creation", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    const error = new Error("Token creation failed");
    jest.mocked(prisma.token.create).mockRejectedValueOnce(error);

    const mockRequest = {
      body: {
        email: "john@example.com",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await passwordRecoverRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Token creation failed"
    );
  });

  it("should log token creation in console", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(prisma.token.create).mockResolvedValueOnce(mockToken);

    const mockRequest = {
      body: {
        email: "john@example.com",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await passwordRecoverRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(console.log).toHaveBeenCalledWith(">>>>>>", "token-1");
  });
});
