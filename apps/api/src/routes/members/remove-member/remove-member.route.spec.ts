import { Role } from "@/generated/prisma";
import { removeMemberService } from "@/services/members/remove-member";
import { removeMemberRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/members/remove-member/remove-member.service");

describe("removeMemberRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register DELETE route for /organizations/:organizationSlug/members/:memberId", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn(),
    };

    // Act
    await removeMemberRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.delete).toHaveBeenCalledWith(
      "/organizations/:organizationSlug/members/:memberId",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call removeMemberService with correct parameters", async () => {
    // Arrange
    const mockRemovedMember = {
      id: "member-1",
      userId: "user-to-remove",
      organizationId: "org-1",
      role: Role.MEMBER,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(removeMemberService).mockResolvedValueOnce(mockRemovedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await removeMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(removeMemberService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
      memberId: "member-1",
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Service error");
    jest.mocked(removeMemberService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await removeMemberRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Service error"
    );
    expect(removeMemberService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
      memberId: "member-1",
    });
  });

  it("should work with different organization and member IDs", async () => {
    // Arrange
    const mockRemovedMember = {
      id: "member-2",
      userId: "user-to-remove-2",
      organizationId: "org-2",
      role: Role.ADMIN,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(removeMemberService).mockResolvedValueOnce(mockRemovedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: { organizationSlug: "different-org", memberId: "member-2" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await removeMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(removeMemberService).toHaveBeenCalledWith({
      userId: "user-2",
      organizationSlug: "different-org",
      memberId: "member-2",
    });
  });

  it("should return 204 No Content on successful removal", async () => {
    // Arrange
    const mockRemovedMember = {
      id: "member-1",
      userId: "user-to-remove",
      organizationId: "org-1",
      role: Role.MEMBER,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(removeMemberService).mockResolvedValueOnce(mockRemovedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      delete: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await removeMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });
});
