import { prisma } from "@/infra/prisma/prisma-connection";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { hash } from "bcryptjs";
import { createUserAccountRoute } from ".";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs");

describe("createUserAccountRoute", () => {
  const mockUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "$2a$10$hashedpassword",
    avatarUrl: null,
    githubId: null,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  const mockOrganization = {
    id: "org-1",
    name: "Example Organization",
    slug: "example-org",
    domain: "example.com",
    shouldAttachUsersByDomain: true,
    avatarUrl: null,
    ownerId: "owner-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /users", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await createUserAccountRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/users",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should create user account with valid data", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    jest.mocked(prisma.organization.findFirst).mockResolvedValueOnce(null);
    jest.mocked(hash).mockResolvedValueOnce("$2a$10$hashedpassword" as never);
    jest.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
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

    await createUserAccountRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@example.com" },
    });
    expect(hash).toHaveBeenCalledWith("password123", 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2a$10$hashedpassword",
      },
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      data: { user: mockUser },
    });
  });

  it("should throw ConflictError when user already exists", async () => {
    // Arrange
    // Clear and reset any previous mocks
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Set up the mock to return an existing user
    jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
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

    await createUserAccountRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      ConflictError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User already exists"
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("should auto-join organization when domain matches", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    jest
      .mocked(prisma.organization.findFirst)
      .mockResolvedValueOnce(mockOrganization);
    jest.mocked(hash).mockResolvedValue("$2a$10$hashedpassword");
    jest.mocked(prisma.user.create).mockResolvedValueOnce(mockUser);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
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

    await createUserAccountRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(prisma.organization.findFirst).toHaveBeenCalledWith({
      where: {
        domain: "example.com",
        shouldAttachUsersByDomain: true,
      },
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2a$10$hashedpassword",
        memberships: {
          create: {
            organizationId: "org-1",
          },
        },
      },
    });
  });

  it("should handle database errors", async () => {
    // Arrange
    const error = new Error("Database connection failed");
    jest.mocked(prisma.user.findUnique).mockRejectedValueOnce(error);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
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

    await createUserAccountRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );
  });

  it("should handle hashing errors", async () => {
    // Arrange
    jest.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    jest.mocked(prisma.organization.findFirst).mockResolvedValueOnce(null);
    const error = new Error("Hashing failed");
    jest.mocked(hash).mockRejectedValue(error);

    const mockRequest = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
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

    await createUserAccountRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Hashing failed"
    );
  });
});
