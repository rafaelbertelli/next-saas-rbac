import { authMiddleware } from "@/http/middlewares/auth";
import { revokeInviteService } from "@/services/invites/revoke-invite";
import { revokeInviteRoute } from "./revoke-invite.route";

// Mock dependencies
jest.mock("@/http/middlewares/auth");
jest.mock("@/services/invites/revoke-invite");

const mockAuthMiddleware = authMiddleware as jest.MockedFunction<
  typeof authMiddleware
>;
const mockRevokeInviteService = revokeInviteService as jest.MockedFunction<
  typeof revokeInviteService
>;

describe("revokeInviteRoute", () => {
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
      delete: jest.fn((path, options, handler) => {
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
      await revokeInviteRoute(mockApp);

      // Assert
      expect(mockApp.withTypeProvider).toHaveBeenCalled();
      expect(mockApp.register).toHaveBeenCalledWith(authMiddleware);
      expect(mockApp.delete).toHaveBeenCalledWith(
        "/organizations/:slug/invites/:inviteId",
        expect.objectContaining({
          schema: expect.any(Object),
        }),
        expect.any(Function)
      );
    });

    it("should register with correct schema", async () => {
      // Arrange & Act
      await revokeInviteRoute(mockApp);

      // Assert
      const [, options] = mockApp.delete.mock.calls[0];
      expect(options.schema).toBeDefined();
      expect(options.schema.tags).toEqual(["organizations", "invites"]);
      expect(options.schema.summary).toBe("Revoke an invite");
    });
  });

  describe("Route Handler Success Cases", () => {
    it("should revoke invite successfully", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "test-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalledWith();
    });

    it("should handle different organization slugs", async () => {
      // Arrange
      const userId = "user-456";
      const slug = "different-org-slug";
      const inviteId = "550e8400-e29b-41d4-a716-446655440001";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalledWith();
    });

    it("should handle different invite IDs", async () => {
      // Arrange
      const userId = "user-789";
      const slug = "test-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440002";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(204);
    });

    it("should handle slug with special characters", async () => {
      // Arrange
      const userId = "user-special";
      const slug = "org-with-dashes_and_underscores";
      const inviteId = "550e8400-e29b-41d4-a716-446655440003";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });
  });

  describe("Route Handler Error Cases", () => {
    it("should throw error when getCurrentUserId fails", async () => {
      // Arrange
      const error = new Error("Authentication failed");
      mockRequest.getCurrentUserId.mockRejectedValue(error);
      mockRequest.params = {
        slug: "test-org",
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      await revokeInviteRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Authentication failed"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockRevokeInviteService).not.toHaveBeenCalled();
    });

    it("should throw error when revokeInviteService fails", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "error-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";
      const error = new Error("Service error");

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockRejectedValue(error);

      await revokeInviteRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Service error"
      );
      expect(mockRequest.getCurrentUserId).toHaveBeenCalled();
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });

    it("should throw error when invite not found", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "test-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";
      const error = new Error("Invite not found");

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockRejectedValue(error);

      await revokeInviteRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Invite not found"
      );
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });

    it("should throw error when user lacks permission", async () => {
      // Arrange
      const userId = "user-123";
      const slug = "test-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";
      const error = new Error("Insufficient permissions");

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockRejectedValue(error);

      await revokeInviteRoute(mockApp);

      // Act & Assert
      await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
        "Insufficient permissions"
      );
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });
  });

  describe("Parameter Handling", () => {
    it("should extract slug and inviteId from request params correctly", async () => {
      // Arrange
      const userId = "user-params";
      const slug = "param-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });

    it("should handle UUID invite IDs correctly", async () => {
      // Arrange
      const userId = "user-uuid";
      const slug = "uuid-org";
      const inviteId = "123e4567-e89b-12d3-a456-426614174000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });
  });

  describe("Response Validation", () => {
    it("should return 204 status code with no content", async () => {
      // Arrange
      const userId = "user-response";
      const slug = "response-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalledWith();
      expect(mockReply.status).toHaveBeenCalledTimes(1);
      expect(mockReply.send).toHaveBeenCalledTimes(1);
    });

    it("should not return any response body", async () => {
      // Arrange
      const userId = "user-no-body";
      const slug = "no-body-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockReply.send).toHaveBeenCalledWith();
      const [responseData] = mockReply.send.mock.calls[0];
      expect(responseData).toBeUndefined();
    });
  });

  describe("Integration", () => {
    it("should call all dependencies with correct parameters", async () => {
      // Arrange
      const userId = "integration-user";
      const slug = "integration-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRequest.getCurrentUserId).toHaveBeenCalledTimes(1);
      expect(mockRevokeInviteService).toHaveBeenCalledTimes(1);
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
    });

    it("should handle service completing successfully", async () => {
      // Arrange
      const userId = "user-void";
      const slug = "void-org";
      const inviteId = "550e8400-e29b-41d4-a716-446655440000";

      mockRequest.getCurrentUserId.mockResolvedValue(userId);
      mockRequest.params = { slug, inviteId };
      mockRevokeInviteService.mockResolvedValue(undefined);

      await revokeInviteRoute(mockApp);

      // Act
      await routeHandler(mockRequest, mockReply);

      // Assert
      expect(mockRevokeInviteService).toHaveBeenCalledWith({
        inviteId,
        organizationSlug: slug,
        userId,
      });
      expect(mockReply.status).toHaveBeenCalledWith(204);
    });
  });
});
