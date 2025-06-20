import { authMiddleware } from "@/http/middlewares/auth";
import { getPendingInvitesService } from "@/services/invites/get-pending-invites";
import { getPendingInvitesRoute } from ".";

// Mock dependencies
jest.mock("@/http/middlewares/auth");
jest.mock("@/services/invites/get-pending-invites");

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;
const mockGetPendingInvitesService =
  getPendingInvitesService as jest.MockedFunction<
    typeof getPendingInvitesService
  >;

describe("getPendingInvitesRoute", () => {
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
      await getPendingInvitesRoute(mockApp);

      // Assert
      expect(mockApp.withTypeProvider).toHaveBeenCalled();
      expect(mockApp.register).toHaveBeenCalledWith(authMiddleware);
      expect(mockApp.get).toHaveBeenCalledWith(
        "/invites/pending",
        expect.objectContaining({
          schema: expect.any(Object),
        }),
        expect.any(Function)
      );
    });

    it("should register with correct schema", async () => {
      // Arrange & Act
      await getPendingInvitesRoute(mockApp);

      // Assert
      const [, options] = mockApp.get.mock.calls[0];
      expect(options.schema).toBeDefined();
      expect(options.schema.tags).toEqual(["invites"]);
      expect(options.schema.summary).toBe(
        "Get pending invites for current user"
      );
    });
  });

  describe("Route Handler Success Cases", () => {
    it("should return pending invites successfully", async () => {
      // Arrange
      const userId = "user-123";
      const mockInvites: any[] = [
        {
          id: "invite-1",
          email: "user@example.com",
          role: "MEMBER",
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-1",
            name: "Test Organization",
            slug: "test-org",
            avatarUrl: null,
          },
          inviter: {
            id: "inviter-1",
            name: "John Doe",
            email: "john@example.com",
          },
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetPendingInvitesService).toHaveBeenCalledWith(userId);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Pending invites retrieved successfully",
        data: {
          invites: mockInvites,
        },
      });
    });

    it("should return empty array when user has no pending invites", async () => {
      // Arrange
      const userId = "user-456";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetPendingInvitesService).toHaveBeenCalledWith(userId);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Pending invites retrieved successfully",
        data: {
          invites: [],
        },
      });
    });

    it("should handle multiple pending invites with different roles", async () => {
      // Arrange
      const userId = "user-789";
      const mockInvites: any[] = [
        {
          id: "invite-1",
          email: "user@example.com",
          role: "MEMBER",
          status: "PENDING",
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
          organization: {
            id: "org-1",
            name: "Organization 1",
            slug: "org-1",
            avatarUrl: "https://example.com/avatar1.jpg",
          },
          inviter: {
            id: "inviter-1",
            name: "Admin User",
            email: "admin@org1.com",
          },
        },
        {
          id: "invite-2",
          email: "user@example.com",
          role: "ADMIN",
          status: "PENDING",
          createdAt: new Date("2023-01-02"),
          updatedAt: new Date("2023-01-02"),
          organization: {
            id: "org-2",
            name: "Organization 2",
            slug: "org-2",
            avatarUrl: null,
          },
          inviter: null,
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockGetPendingInvitesService).toHaveBeenCalledWith(userId);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Pending invites retrieved successfully",
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

      await getPendingInvitesRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Authentication failed"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetPendingInvitesService).not.toHaveBeenCalled();
    });

    it("should throw error when getPendingInvitesService fails", async () => {
      // Arrange
      const userId = "user-123";
      const error = new Error("Service error");

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockRejectedValue(error);

      await getPendingInvitesRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Service error"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockGetPendingInvitesService).toHaveBeenCalledWith(userId);
    });
  });

  describe("Response Validation", () => {
    it("should return response with correct structure", async () => {
      // Arrange
      const userId = "user-response";
      const mockInvites: any[] = [
        {
          id: "invite-response",
          email: "response@example.com",
          role: "BILLING",
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-response",
            name: "Response Org",
            slug: "response-org",
            avatarUrl: null,
          },
          inviter: {
            id: "inviter-response",
            name: null,
            email: "inviter@response.com",
          },
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      const [responseData] = mockReply.send.mock.calls[0];
      expect(responseData).toHaveProperty("message");
      expect(responseData).toHaveProperty("data");
      expect(responseData.data).toHaveProperty("invites");
      expect(responseData.message).toBe(
        "Pending invites retrieved successfully"
      );
      expect(Array.isArray(responseData.data.invites)).toBe(true);
    });

    it("should return 200 status code", async () => {
      // Arrange
      const userId = "user-status";
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

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
      const mockInvites: any[] = [];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalledTimes(1);
      expect(mockGetPendingInvitesService).toHaveBeenCalledTimes(1);
      expect(mockGetPendingInvitesService).toHaveBeenCalledWith(userId);
    });

    it("should handle service returning different invite structures", async () => {
      // Arrange
      const userId = "user-structure";
      const mockInvites: any[] = [
        {
          id: "invite-structure",
          email: "structure@example.com",
          role: "ADMIN",
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          organization: {
            id: "org-structure",
            name: "Structure Org",
            slug: "structure-org",
            avatarUrl: "https://example.com/structure.jpg",
          },
          inviter: null,
        },
      ];

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockGetPendingInvitesService.mockResolvedValue(mockInvites);

      await getPendingInvitesRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Pending invites retrieved successfully",
        data: {
          invites: mockInvites,
        },
      });
    });
  });
});
