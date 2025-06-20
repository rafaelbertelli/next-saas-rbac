import { BadRequestError } from "@/routes/_error/4xx/bad-request-error";
import { acceptInviteService } from "@/services/invites/accept-invite";
import { acceptInviteRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-123");
    });
  }),
}));

jest.mock("@/services/invites/accept-invite/accept-invite.service");

describe("acceptInviteRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register POST route for /invites/:inviteId/accept", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    // Act
    await acceptInviteRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalledWith(
      "/invites/:inviteId/accept",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should accept invite successfully and return 204", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockResolvedValue(undefined);

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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(acceptInviteService).toHaveBeenCalledWith({
      userId: "user-123",
      inviteId: "invite-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle different invite and user IDs", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockResolvedValue(undefined);

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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(acceptInviteService).toHaveBeenCalledWith({
      userId: "user-456",
      inviteId: "invite-456",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should throw BadRequestError when invite is no longer valid", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockRejectedValue(
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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invite is no longer valid"
    );

    expect(acceptInviteService).toHaveBeenCalledWith({
      userId: "user-123",
      inviteId: "invite-123",
    });
  });

  it("should throw BadRequestError when email doesn't match", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockRejectedValue(
      new BadRequestError(
        "You can only accept invites sent to your email address"
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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "You can only accept invites sent to your email address"
    );
  });

  it("should throw BadRequestError when user is already a member", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockRejectedValue(
      new BadRequestError("You are already a member of this organization")
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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      BadRequestError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "You are already a member of this organization"
    );
  });

  it("should handle service errors", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
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
      register: jest.fn().mockReturnThis(),
      post: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await acceptInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Internal server error"
    );
  });

  it("should handle auth errors", async () => {
    // Arrange
    (acceptInviteService as jest.Mock).mockResolvedValue(undefined);

    const mockRequest = {
      params: { inviteId: "invite-123" },
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

    await acceptInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Unauthorized"
    );

    expect(acceptInviteService).not.toHaveBeenCalled();
  });
});
