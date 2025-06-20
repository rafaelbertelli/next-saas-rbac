import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { ForbiddenError } from "@/routes/_error/4xx/forbidden-error";
import { createInviteService } from "@/services/invites/create-invite/create-invite.service";
import { createInviteRoute } from "./create-invite.route";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-123");
    });
  }),
}));

jest.mock("@/services/invites/create-invite/create-invite.service");

describe("createInviteRoute", () => {
  const mockInvite = {
    id: "invite-123",
    email: "test@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-123",
    inviterId: "user-123",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /organizations/:slug/invites", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await createInviteRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/organizations/:slug/invites",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should create invite successfully with MEMBER role", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createInviteService).toHaveBeenCalledWith({
      email: "test@example.com",
      role: "MEMBER",
      organizationSlug: "test-org",
      userId: "user-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Invite created successfully",
      data: {
        inviteId: "invite-123",
      },
    });
  });

  it("should create invite successfully with ADMIN role", async () => {
    // Arrange
    const adminInvite = { ...mockInvite, role: "ADMIN" as const };
    (createInviteService as jest.Mock).mockResolvedValue(adminInvite);

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "admin@example.com", role: "ADMIN" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createInviteService).toHaveBeenCalledWith({
      email: "admin@example.com",
      role: "ADMIN",
      organizationSlug: "test-org",
      userId: "user-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Invite created successfully",
      data: {
        inviteId: "invite-123",
      },
    });
  });

  it("should create invite successfully with BILLING role", async () => {
    // Arrange
    const billingInvite = { ...mockInvite, role: "BILLING" as const };
    (createInviteService as jest.Mock).mockResolvedValue(billingInvite);

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "billing@example.com", role: "BILLING" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createInviteService).toHaveBeenCalledWith({
      email: "billing@example.com",
      role: "BILLING",
      organizationSlug: "test-org",
      userId: "user-123",
    });
  });

  it("should handle different organization slugs", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { slug: "another-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-456"),
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

    await createInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(createInviteService).toHaveBeenCalledWith({
      email: "test@example.com",
      role: "MEMBER",
      organizationSlug: "another-org",
      userId: "user-456",
    });
  });

  it("should throw ForbiddenError when user lacks permissions", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockRejectedValue(
      new ForbiddenError("User does not have permission to create invites")
    );

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      ForbiddenError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "User does not have permission to create invites"
    );
  });

  it("should throw BadRequestError when domain auto-attach is enabled", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockRejectedValue(
      new BadRequestError(
        "Users with domain test.com will be added automatically to the organization on login"
      )
    );

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@test.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
  });

  it("should throw ConflictError when user is already a member", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockRejectedValue(
      new ConflictError("User is already a member of this organization")
    );

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "member@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      ConflictError
    );
  });

  it("should throw ConflictError when invite already exists", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockRejectedValue(
      new ConflictError("Invite already exists for this email and organization")
    );

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      ConflictError
    );
  });

  it("should handle service errors", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Internal server error"
    );
  });

  it("should handle auth errors", async () => {
    // Arrange
    (createInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { slug: "test-org" },
      body: { email: "test@example.com", role: "MEMBER" },
      getCurrentUserId: jest.fn().mockRejectedValue(new Error("Unauthorized")),
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

    await createInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Unauthorized"
    );

    expect(createInviteService).not.toHaveBeenCalled();
  });
});
