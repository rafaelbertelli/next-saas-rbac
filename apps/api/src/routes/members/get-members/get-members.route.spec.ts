import { Role } from "@/generated/prisma";
import { getMembersService } from "@/services/members/get-members";
import { getMembersRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/members/get-members");

describe("getMembersRoute", () => {
  const mockMembers = [
    {
      id: "member-1",
      userId: "user-1",
      role: Role.ADMIN,
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: null,
      },
    },
    {
      id: "member-2",
      userId: "user-2",
      role: Role.MEMBER,
      user: {
        id: "user-2",
        name: "Jane Doe",
        email: "jane@example.com",
        avatarUrl: null,
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register GET route for /organizations/:organizationSlug/members", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getMembersRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:organizationSlug/members",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call getMembersService with correct parameters", async () => {
    // Arrange
    jest.mocked(getMembersService).mockResolvedValueOnce(mockMembers);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug" },
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

    await getMembersRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getMembersService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Members retrieved successfully",
      data: {
        members: mockMembers,
      },
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Service error");
    jest.mocked(getMembersService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug" },
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

    await getMembersRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Service error"
    );
    expect(getMembersService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
    });
  });

  it("should work with different organization slugs", async () => {
    // Arrange
    jest.mocked(getMembersService).mockResolvedValueOnce(mockMembers);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "different-org" },
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

    await getMembersRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getMembersService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "different-org",
    });
  });

  it("should return empty array when no members found", async () => {
    // Arrange
    jest.mocked(getMembersService).mockResolvedValueOnce([]);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug" },
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

    await getMembersRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Members retrieved successfully",
      data: {
        members: [],
      },
    });
  });
});
