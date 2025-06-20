import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { rejectInviteService } from "@/services/invites/reject-invite";
import { rejectInviteRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-123");
    });
  }),
}));

jest.mock("@/services/invites/reject-invite");

describe("rejectInviteRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /invites/:inviteId/reject", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await rejectInviteRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/invites/:inviteId/reject",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should reject invite successfully and return 204", async () => {
    // Arrange
    const mockInvite = {
      id: "invite-123",
      email: "john@example.com",
      role: "MEMBER" as const,
      status: "REJECTED" as const,
      organizationId: "org-123",
      inviterId: "inviter-123",
    };

    (rejectInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await rejectInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      userId: "user-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle different invite and user IDs", async () => {
    // Arrange
    const mockInvite = {
      id: "invite-456",
      status: "REJECTED" as const,
    };

    (rejectInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { inviteId: "invite-456" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-456"),
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

    await rejectInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-456",
      userId: "user-456",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should throw NotFoundError when invite is not found", async () => {
    // Arrange
    (rejectInviteService as jest.Mock).mockRejectedValue(
      new NotFoundError("Invite not found")
    );

    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await rejectInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      NotFoundError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invite not found"
    );

    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      userId: "user-123",
    });
  });

  it("should throw BadRequestError when invite is no longer valid", async () => {
    // Arrange
    (rejectInviteService as jest.Mock).mockRejectedValue(
      new BadRequestError("Invite is no longer valid")
    );

    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await rejectInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invite is no longer valid"
    );

    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      userId: "user-123",
    });
  });

  it("should throw BadRequestError when email doesn't match", async () => {
    // Arrange
    (rejectInviteService as jest.Mock).mockRejectedValue(
      new BadRequestError(
        "You can only reject invites sent to your email address"
      )
    );

    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await rejectInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "You can only reject invites sent to your email address"
    );

    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      userId: "user-123",
    });
  });

  it("should handle getCurrentUserId failure", async () => {
    // Arrange
    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest
        .fn()
        .mockRejectedValue(new Error("Failed to get user ID")),
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

    await rejectInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Failed to get user ID"
    );

    expect(rejectInviteService).not.toHaveBeenCalled();
  });

  it("should handle generic service errors", async () => {
    // Arrange
    (rejectInviteService as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const mockRequest = {
      params: { inviteId: "invite-123" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
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

    await rejectInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Database connection failed"
    );

    expect(rejectInviteService).toHaveBeenCalledWith({
      inviteId: "invite-123",
      userId: "user-123",
    });
  });
});
