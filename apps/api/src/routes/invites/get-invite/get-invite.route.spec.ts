import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getInviteService } from "@/services/invites/get-invite";
import { getInviteRoute } from ".";

jest.mock("@/services/invites/get-invite");

describe("getInviteRoute", () => {
  const mockInvite = {
    id: "invite-123",
    email: "test@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-123",
    inviterId: "user-123",
    organization: {
      id: "org-123",
      name: "Test Organization",
      slug: "test-org",
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /invites/:inviteId", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getInviteRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/invites/:inviteId",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should get invite successfully and return 200", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockResolvedValue(mockInvite);

    const mockRequest = {
      params: { inviteId: "invite-123" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getInviteService).toHaveBeenCalledWith("invite-123");
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Invites retrieved successfully",
      data: {
        invite: mockInvite,
      },
    });
  });

  it("should throw NotFoundError when invite not found", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockRejectedValue(
      new NotFoundError("Invite not found")
    );

    const mockRequest = {
      params: { inviteId: "non-existent-invite" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      NotFoundError
    );
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Invite not found"
    );
  });

  it("should handle different invite IDs", async () => {
    // Arrange
    const differentInvite = { ...mockInvite, id: "invite-456" };
    (getInviteService as jest.Mock).mockResolvedValue(differentInvite);

    const mockRequest = {
      params: { inviteId: "invite-456" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getInviteRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getInviteService).toHaveBeenCalledWith("invite-456");
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Invites retrieved successfully",
      data: {
        invite: differentInvite,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    (getInviteService as jest.Mock).mockRejectedValue(
      new Error("Internal server error")
    );

    const mockRequest = {
      params: { inviteId: "invite-123" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getInviteRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Internal server error"
    );
  });
});
