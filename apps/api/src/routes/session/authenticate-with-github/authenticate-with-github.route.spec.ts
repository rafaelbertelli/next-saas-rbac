import { prisma } from "@/infra/prisma/prisma-connection";
import { BadGatewayError } from "@/routes/_error/5xx/bad-gateway-error";
import { authenticateWithGithubRoute } from ".";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@repo/env", () => ({
  env: {
    GITHUB_OAUTH_LOGIN_URI: "https://github.com/login/oauth/access_token",
    GITHUB_OAUTH_REDIRECT_URI: "http://localhost:3000/api/auth/github/callback",
    GITHUB_OAUTH_CLIENT_SECRET: "test_client_secret",
    GITHUB_OAUTH_CLIENT_ID: "test_client_id",
    GITHUB_OAUTH_GRANTED_ACCESS_URI: "https://api.github.com/user",
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe("authenticateWithGithubRoute", () => {
  const mockUser = {
    id: "user-1",
    email: "john@github.com",
    name: "John Doe",
    passwordHash: null,
    avatarUrl: "https://github.com/avatar.jpg",
    githubId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockAccount = {
    id: "account-1",
    ownerId: "user-1",
    provider: "GITHUB" as const,
    providerAccountId: "12345",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockGithubTokenResponse = {
    access_token: "github_access_token",
    scope: "user:email",
    token_type: "bearer" as const,
  };

  const mockGithubUserData = {
    id: 12345,
    name: "John Doe",
    email: "john@github.com",
    avatar_url: "https://github.com/avatar.jpg",
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should register POST route for /session/authenticate-with-github", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await authenticateWithGithubRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/session/authenticate-with-github",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should authenticate user with valid github code for existing user", async () => {
    // Arrange
    jest
      .mocked(fetch)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubTokenResponse),
      } as any)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubUserData),
      } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(prisma.account.findUnique).mockResolvedValueOnce(mockAccount);

    const mockRequest = {
      body: {
        code: "github_auth_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@github.com" },
    });
    expect(prisma.account.findUnique).toHaveBeenCalledWith({
      where: {
        provider_ownerId: {
          provider: "GITHUB",
          ownerId: "user-1",
        },
      },
    });
    expect(mockReply.jwtSign).toHaveBeenCalledWith(
      { sub: "user-1" },
      { sign: { expiresIn: "7d" } }
    );
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Logged in successfully",
      data: { token: "jwt-token" },
    });
  });

  it("should create new user and account when user does not exist", async () => {
    // Arrange
    jest
      .mocked(fetch)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubTokenResponse),
      } as any)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubUserData),
      } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    jest.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);
    jest.mocked(prisma.account.findUnique).mockResolvedValueOnce(null);
    jest.mocked(prisma.account.create).mockResolvedValueOnce(mockAccount);

    const mockRequest = {
      body: {
        code: "github_auth_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "john@github.com",
        name: "John Doe",
        avatarUrl: "https://github.com/avatar.jpg",
      },
    });
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        ownerId: "user-1",
        provider: "GITHUB",
        providerAccountId: "12345",
      },
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it("should create new account when user exists but account does not", async () => {
    // Arrange
    jest
      .mocked(fetch)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubTokenResponse),
      } as any)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubUserData),
      } as any);

    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
    jest.mocked(prisma.account.findUnique).mockResolvedValueOnce(null);
    jest.mocked(prisma.account.create).mockResolvedValueOnce(mockAccount);

    const mockRequest = {
      body: {
        code: "github_auth_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        ownerId: "user-1",
        provider: "GITHUB",
        providerAccountId: "12345",
      },
    });
  });

  it("should throw BadGatewayError when github user has no email", async () => {
    // Arrange
    const githubUserWithoutEmail = {
      id: 12345,
      name: "John Doe",
      email: "", // Email vazio (já transformado pelo schema) para que chegue na validação correta
      avatar_url: "https://github.com/avatar.jpg",
    };

    jest
      .mocked(fetch)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubTokenResponse),
      } as any)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(githubUserWithoutEmail),
      } as any);

    const mockRequest = {
      body: {
        code: "github_auth_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadGatewayError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to authenticate with Github"
    );
  });

  it("should throw BadGatewayError when github oauth fails", async () => {
    // Arrange
    jest.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const mockRequest = {
      body: {
        code: "invalid_github_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadGatewayError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to authenticate with Github"
    );
  });

  it("should handle github API errors gracefully", async () => {
    // Arrange
    jest
      .mocked(fetch)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockGithubTokenResponse),
      } as any)
      .mockResolvedValueOnce({
        json: jest.fn().mockRejectedValue(new Error("Invalid token")),
      } as any);

    const mockRequest = {
      body: {
        code: "github_auth_code",
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

    await authenticateWithGithubRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadGatewayError
    );
  });
});
