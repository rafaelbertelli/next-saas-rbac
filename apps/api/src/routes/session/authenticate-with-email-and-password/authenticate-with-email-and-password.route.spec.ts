import { prisma } from "@/infra/prisma/prisma-connection";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { compare } from "bcryptjs";
import { authenticateWithEmailAndPasswordRoute } from ".";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs");

describe("authenticateWithEmailAndPasswordRoute", () => {
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

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should register POST route for /session/email-and-password", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/session/email-and-password",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should authenticate user with valid credentials", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(compare).mockResolvedValue(true);

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "validpassword",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      jwtSign: jest.fn().mockResolvedValue("jwt-token"),
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

    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });
    expect(compare).toHaveBeenCalledWith(
      "validpassword",
      "$2a$10$hashedpassword"
    );
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      { sub: "user-1" },
      { sign: { expiresIn: "7d" } }
    );
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Logged in successfully",
      data: { token: "jwt-token" },
    });
  });

  it("should throw UnauthorizedError when user not found", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const mockRequest = {
      body: {
        email: "nonexistent@example.com",
        password: "password",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      jwtSign: jest.fn(),
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

    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid credentials"
    );
  });

  it("should throw UnauthorizedError when user has no password", async () => {
    // Arrange
    const userWithoutPassword = { ...mockUser, passwordHash: null };

    // Reset and set specific mock implementation
    jest.mocked(prisma.user.findUnique).mockReset();
    jest
      .mocked(prisma.user.findUnique)
      .mockImplementation(async ({ where }) => {
        if (where.email === "john@example.com") {
          return userWithoutPassword;
        }
        return null;
      });

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "password",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      jwtSign: jest.fn(),
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

    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User does not have a password. Use social login."
    );
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "authenticate with email and password",
      userId: "user-1",
    });
  });

  it("should throw UnauthorizedError when password is invalid", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(compare).mockResolvedValue(false);

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "wrongpassword",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      jwtSign: jest.fn(),
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

    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid credentials"
    );
    expect(compare).toHaveBeenCalledWith(
      "wrongpassword",
      "$2a$10$hashedpassword"
    );
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "authenticate with email and password",
      userId: "user-1",
    });
  });

  it("should handle database errors", async () => {
    // Arrange
    const error = new Error("Database connection failed");
    jest.mocked(prisma.user.findUnique).mockRejectedValueOnce(error);

    const mockRequest = {
      body: {
        email: "john@example.com",
        password: "password",
      },
      log: {
        error: jest.fn(),
      },
    };
    const mockReply = {
      jwtSign: jest.fn(),
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

    await authenticateWithEmailAndPasswordRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );
  });
});
