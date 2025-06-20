import { authMiddleware } from "@/http/middlewares/auth";
import { getInvitesByOrganizationService } from "@/services/invites/get-invites-by-organization";
import { getInvitesRoute } from ".";

// Mock dependencies
jest.mock("@/http/middlewares/auth");
jest.mock("@/services/invites/get-invites-by-organization");

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;
const mockGetInvitesByOrganizationService =
  getInvitesByOrganizationService as jest.MockedFunction<
    typeof getInvitesByOrganizationService
  >;

describe("getInvitesRoute", () => {
  let mockApp: any;
  let mockRequest: any;
  let mockReply: any;
  let routeHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock reply methods
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Mock request
    mockRequest = {
      getCurrentUserId: jest.fn(),
      params: {},
    };

    // Mock app with route registration
    mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    // Mock auth middleware
    mockAuthMiddleware.mockImplementation(async (app) => {
      // Auth middleware implementation mock
    });
  });

  describe("Route Registration", () => {
    it("should register route with correct path and method", async () => {
      // Arrange & Act
      await getInvitesRoute(mockApp);

      // Assert
      expect(mockApp.withTypeProvider).toHaveBeenCalled();
      expect(mockApp.register).toHaveBeenCalledWith(authMiddleware);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/organizations/:slug/invites",
        expect.objectContaining({
          schema: expect.any(Object),
        }),
        expect.any(Function)
      );
    });

    it("should register with correct schema", async () => {
      // Arrange & Act
      await getInvitesRoute(mockApp);

      // Assert
      const [, options] = mockApp.get.mock.calls[0];
      expect(options.schema).toBeDefined();
      expect(options.schema.tags).toEqual(["organizations", "invites"]);
      expect(options.schema.summary).toBe("Get organization invites");
    });
  });

  describe("Route Handler Success Cases", () => {
    it("should return invites successfully", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "test-org";
      const mockInvites = [
        {
          id: "invite-1",
          email: "user1@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          inviterId: "inviter-1",
          organizationId: "org-1",
          inviter: {
            id: "inviter-1",
            name: "Inviter Name",
            email: "inviter@example.com",
            avatarUrl: null,
          },
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Invites retrieved successfully",
        data: {
          invites: mockInvites,
        },
      });
    });

    it("should return empty array when no invites exist", async () => {
      // Arrange
      const userId = "user-456";
      const slug = "empty-org";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Invites retrieved successfully",
        data: {
          invites: [],
        },
      });
    });

    it("should handle multiple invites with different roles and statuses", async () => {
      // Arrange
      const userId = "user-789";
      const slug = "multi-org";
      const mockInvites = [
        {
          id: "invite-1",
          email: "member@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          inviterId: "inviter-1",
          organizationId: "org-1",
          inviter: {
            id: "inviter-1",
            name: "Admin User",
            email: "admin@example.com",
            avatarUrl: "https://example.com/avatar1.jpg",
          },
        },
        {
          id: "invite-2",
          email: "admin@example.com",
          role: "ADMIN" as const,
          status: "ACCEPTED" as const,
          createdAt: new Date("2023-01-02"),
          updatedAt: new Date("2023-01-03"),
          inviterId: null,
          organizationId: "org-2",
          inviter: null,
        },
        {
          id: "invite-3",
          email: "billing@example.com",
          role: "BILLING" as const,
          status: "REJECTED" as const,
          createdAt: new Date("2023-01-04"),
          updatedAt: new Date("2023-01-05"),
          inviterId: "inviter-2",
          organizationId: "org-3",
          inviter: {
            id: "inviter-2",
            name: null,
            email: "owner@example.com",
            avatarUrl: null,
          },
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Invites retrieved successfully",
        data: {
          invites: mockInvites,
        },
      });
    });
  });

  describe("Route Handler Error Cases", () => {
    it("should throw error when getCurrentUserId fails", async () => {
      // Arrange
      const error = new Error("Authentication failed");
      mockRequest.getCurrentUserId.mockRejectedValue(error);
      mockRequest.params = { slug: "test-org" };

      await getInvitesRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Authentication failed"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetInvitesByOrganizationService).not.toHaveBeenCalled();
    });

    it("should throw error when getInvitesByOrganizationService fails", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "error-org";
      const error = new Error("Service error");

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockRejectedValue(error);

      await getInvitesRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Service error"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
    });
  });

  describe("Parameter Handling", () => {
    it("should extract slug from request params correctly", async () => {
      // Arrange
      const userId = "user-params";
      const slug = "special-org-slug";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
    });

    it("should handle slug with special characters", async () => {
      // Arrange
      const userId = "user-special";
      const slug = "org-with-dashes_and_underscores";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
    });
  });

  describe("Response Validation", () => {
    it("should return response with correct structure", async () => {
      // Arrange
      const userId = "user-response";
      const slug = "response-org";
      const mockInvites = [
        {
          id: "invite-response",
          email: "response@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          inviterId: "inviter-response",
          organizationId: "org-response",
          inviter: {
            id: "inviter-response",
            name: "Response Inviter",
            email: "inviter@response.com",
            avatarUrl: null,
          },
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      const [responseData] = mockReply.send.mock.calls[0];
      expect(responseData).toHaveProperty("message");
      expect(responseData).toHaveProperty("data");
      expect(responseData.data).toHaveProperty("invites");
      expect(responseData.message).toBe("Invites retrieved successfully");
      expect(Array.isArray(responseData.data.invites)).toBe(true);
    });

    it("should return 200 status code", async () => {
      // Arrange
      const userId = "user-status";
      const slug = "status-org";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.status).toHaveBeenCalledTimes(1);
      expect(mockReply.send).toHaveBeenCalledTimes(1);
    });
  });

  describe("Integration", () => {
    it("should call all dependencies with correct parameters", async () => {
      // Arrange
      const userId = "integration-user";
      const slug = "integration-org";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalledTimes(1);
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledTimes(1);
      expect(mockGetInvitesByOrganizationService).toHaveBeenCalledWith({
        organizationSlug: slug,
        userId,
      });
    });

    it("should handle service returning different data structures", async () => {
      // Arrange
      const userId = "user-structure";
      const slug = "structure-org";
      const mockInvites = [
        {
          id: "invite-structure",
          email: "structure@example.com",
          role: "ADMIN" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          inviterId: null,
          organizationId: "org-structure",
          inviter: null,
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug };
      mockGetInvitesByOrganizationService.mockResolvedValue(mockInvites);

      await getInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Invites retrieved successfully",
        data: {
          invites: mockInvites,
        },
      });
    });
  });
});
