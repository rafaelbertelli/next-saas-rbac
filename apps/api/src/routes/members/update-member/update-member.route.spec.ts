import { Role } from "@/generated/prisma";
import { updateMemberService } from "@/services/members/update-member";
import { updateMemberRoute } from ".";

jest.mock("@/http/middlewares/auth", () => ({
  authMiddleware: jest.fn((app) => {
    app.addHook("preHandler", async (request: any) => {
      request.getCurrentUserId = jest.fn().mockResolvedValue("user-1");
    });
  }),
}));

jest.mock("@/services/members/update-member/update-member.service");

describe("updateMemberRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register PUT route for /organizations/:organizationSlug/members/:memberId", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn(),
    };

    // Act
    await updateMemberRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.put).toHaveBeenCalledWith(
      "/organizations/:organizationSlug/members/:memberId",
      expect.any(Object),
      expect.any(Function)
    );
  });

  it("should call updateMemberService with correct parameters", async () => {
    // Arrange
    const mockUpdatedMember = {
      id: "member-1",
      userId: "user-1",
      organizationId: "org-1",
      role: Role.ADMIN,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(updateMemberService).mockResolvedValueOnce(mockUpdatedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
      body: { role: Role.ADMIN },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(updateMemberService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
      memberId: "member-1",
      role: Role.ADMIN,
    });
    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalledWith();
  });

  it("should handle service errors", async () => {
    // Arrange
    const error = new Error("Service error");
    jest.mocked(updateMemberService).mockRejectedValueOnce(error);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
      body: { role: Role.ADMIN },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateMemberRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Service error"
    );
    expect(updateMemberService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
      memberId: "member-1",
      role: Role.ADMIN,
    });
  });

  it("should work with different roles", async () => {
    // Arrange
    const mockUpdatedMember = {
      id: "member-1",
      userId: "user-1",
      organizationId: "org-1",
      role: Role.BILLING,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(updateMemberService).mockResolvedValueOnce(mockUpdatedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-1"),
      params: { organizationSlug: "org-slug", memberId: "member-1" },
      body: { role: Role.BILLING },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(updateMemberService).toHaveBeenCalledWith({
      userId: "user-1",
      organizationSlug: "org-slug",
      memberId: "member-1",
      role: Role.BILLING,
    });
  });

  it("should work with different organization and member IDs", async () => {
    // Arrange
    const mockUpdatedMember = {
      id: "member-2",
      userId: "user-2",
      organizationId: "org-2",
      role: Role.MEMBER,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    jest.mocked(updateMemberService).mockResolvedValueOnce(mockUpdatedMember);

    const mockRequest = {
      getCurrentUserId: jest.fn().mockResolvedValue("user-2"),
      params: { organizationSlug: "different-org", memberId: "member-2" },
      body: { role: Role.MEMBER },
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      put: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await updateMemberRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(updateMemberService).toHaveBeenCalledWith({
      userId: "user-2",
      organizationSlug: "different-org",
      memberId: "member-2",
      role: Role.MEMBER,
    });
  });
});
