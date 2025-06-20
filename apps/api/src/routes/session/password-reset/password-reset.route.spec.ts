import { prisma } from "@/infra/prisma/prisma-connection";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { hash } from "bcryptjs";
import { passwordResetRoute } from ".";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    token: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("passwordResetRoute", () => {
  const mockUser = {
    id: "user-1",
    email: "john@example.com",
    name: "John Doe",
    passwordHash: "$2a$10$oldhash",
    avatarUrl: null,
    githubId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockToken = {
    id: "token-1",
    userId: "user-1",
    type: "PASSWORD_RECOVER" as const,
    used: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes from now - SEMPRE NO FUTURO
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockUpdatedUser = {
    ...mockUser,
    passwordHash: "$2a$10$newhash",
  };

  const mockUpdatedToken = {
    ...mockToken,
    used: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should register POST route for /session/password-reset", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await passwordResetRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/session/password-reset",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should reset password with valid token", async () => {
    // Arrange
    const mockTx = {
      user: {
        update: jest.fn().mockResolvedValue(mockUpdatedUser),
      },
      token: {
        update: jest.fn().mockResolvedValue(mockUpdatedToken),
      },
    };

    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(mockToken);
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    (hash as jest.Mock).mockResolvedValue("$2a$10$newhash");
    jest.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return await callback(mockTx as any);
    });

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.token.findUnique).toHaveBeenCalledWith({
      where: { id: "token-1" },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(hash).toHaveBeenCalledWith("newpassword123", 10);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { passwordHash: "$2a$10$newhash" },
    });
    expect(mockTx.token.update).toHaveBeenCalledWith({
      where: { id: "token-1" },
      data: { used: true },
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should throw UnauthorizedError when token not found", async () => {
    // Arrange
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(null);

    const mockRequest = {
      body: {
        token: "invalid-token",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid token"
    );
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "Invalid token",
      userId: undefined,
    });
  });

  it("should throw UnauthorizedError when token is already used", async () => {
    // Arrange
    const usedToken = { ...mockToken, used: true };
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(usedToken);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid token"
    );
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "Invalid token",
      userId: "user-1",
    });
  });

  it("should throw UnauthorizedError when token is expired", async () => {
    // Arrange
    const expiredToken = {
      ...mockToken,
      expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    };
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(expiredToken);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      UnauthorizedError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid token"
    );
  });

  it("should throw NotFoundError when user not found", async () => {
    // Arrange
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(mockToken);
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      NotFoundError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invalid token"
    );
    expect(mockRequest.log.error).toHaveBeenCalledWith({
      message: "User not found",
      userId: "user-1",
    });
  });

  it("should handle database errors during token lookup", async () => {
    // Arrange
    const error = new Error("Database connection failed");
    jest.mocked(prisma.token.findUnique).mockRejectedValueOnce(error);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should handle hashing errors", async () => {
    // Arrange
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(mockToken);
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    const error = new Error("Hashing failed");
    (hash as jest.Mock).mockRejectedValue(error);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Hashing failed"
    );
  });

  it("should handle transaction errors", async () => {
    // Arrange
    jest.mocked(prisma.token.findUnique).mockResolvedValueOnce(mockToken);
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    (hash as jest.Mock).mockResolvedValue("$2a$10$newhash");
    const transactionError = new Error("Transaction failed");
    jest.mocked(prisma.$transaction).mockRejectedValue(transactionError);

    const mockRequest = {
      body: {
        token: "token-1",
        password: "newpassword123",
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

    await passwordResetRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Transaction failed"
    );
    expect(prisma.token.findUnique).toHaveBeenCalledWith({
      where: { id: "token-1" },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(hash).toHaveBeenCalledWith("newpassword123", 10);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
  });
});
