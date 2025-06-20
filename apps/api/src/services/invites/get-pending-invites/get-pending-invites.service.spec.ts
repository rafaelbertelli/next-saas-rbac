import { getPendingInvitesByEmailRepository } from "@/repositories/invites/get-pending-invites-by-email";
import { getUserByIdService } from "@/services/users/get-user-by-id";
import { getPendingInvitesService } from "./get-pending-invites.service";

// Mock dependencies
jest.mock("@/services/users/get-user-by-id");
jest.mock("@/repositories/invites/get-pending-invites-by-email");

const mockGetUserByIdService = getUserByIdService as jest.MockedFunction<
  typeof getUserByIdService
>;
const mockGetPendingInvitesByEmailRepository =
  getPendingInvitesByEmailRepository as jest.MockedFunction<
    typeof getPendingInvitesByEmailRepository
  >;

describe("getPendingInvitesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Success Cases", () => {
    it("should return pending invites for valid user", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "John Doe",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites = [
        {
          id: "invite-1",
          email: "user@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: "org-1",
          inviterId: "author-1",
          inviter: {
            id: "author-1",
            name: "Author Name",
            email: "author@example.com",
          },
          organization: {
            id: "org-1",
            name: "Organization Name",
            slug: "org-slug",
            avatarUrl: null,
          },
        },
      ];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      const result = await getPendingInvitesService(userId);

      // Assert
      expect(result).toEqual(mockInvites);
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        mockUser.email
      );
    });

    it("should return empty array when user has no pending invites", async () => {
      // Arrange
      const userId = "user-456";
      const mockUser = {
        id: userId,
        email: "user2@example.com",
        name: "Jane Doe",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites: any[] = [];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      const result = await getPendingInvitesService(userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        mockUser.email
      );
    });

    it("should return multiple pending invites for user", async () => {
      // Arrange
      const userId = "user-789";
      const mockUser = {
        id: userId,
        email: "multi@example.com",
        name: "Multi User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites = [
        {
          id: "invite-1",
          email: "multi@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: "org-1",
          inviterId: "author-1",
          inviter: {
            id: "author-1",
            name: "Author 1",
            email: "author1@example.com",
          },
          organization: {
            id: "org-1",
            name: "Organization 1",
            slug: "org-1-slug",
            avatarUrl: null,
          },
        },
        {
          id: "invite-2",
          email: "multi@example.com",
          role: "ADMIN" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: "org-2",
          inviterId: "author-2",
          inviter: {
            id: "author-2",
            name: "Author 2",
            email: "author2@example.com",
          },
          organization: {
            id: "org-2",
            name: "Organization 2",
            slug: "org-2-slug",
            avatarUrl: null,
          },
        },
      ];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      const result = await getPendingInvitesService(userId);

      // Assert
      expect(result).toEqual(mockInvites);
      expect(result).toHaveLength(2);
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        mockUser.email
      );
    });
  });

  describe("Error Cases", () => {
    it("should throw error when getUserByIdService fails", async () => {
      // Arrange
      const userId = "invalid-user";
      const error = new Error("User not found");

      mockGetUserByIdService.mockRejectedValue(error);

      // Act & Assert
      await expect(getPendingInvitesService(userId)).rejects.toThrow(
        "User not found"
      );
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).not.toHaveBeenCalled();
    });

    it("should throw error when getPendingInvitesByEmailRepository fails", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "John Doe",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const error = new Error("Database connection failed");

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockRejectedValue(error);

      // Act & Assert
      await expect(getPendingInvitesService(userId)).rejects.toThrow(
        "Database connection failed"
      );
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        mockUser.email
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with special characters in email", async () => {
      // Arrange
      const userId = "user-special";
      const mockUser = {
        id: userId,
        email: "user+special@example.com",
        name: "Special User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites = [
        {
          id: "invite-special",
          email: "user+special@example.com",
          role: "MEMBER" as const,
          status: "PENDING" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          organizationId: "org-1",
          inviterId: "author-1",
          inviter: {
            id: "author-1",
            name: "Author Name",
            email: "author@example.com",
          },
          organization: {
            id: "org-1",
            name: "Organization Name",
            slug: "org-slug",
            avatarUrl: null,
          },
        },
      ];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      const result = await getPendingInvitesService(userId);

      // Assert
      expect(result).toEqual(mockInvites);
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        "user+special@example.com"
      );
    });

    it("should handle user with uppercase email", async () => {
      // Arrange
      const userId = "user-uppercase";
      const mockUser = {
        id: userId,
        email: "USER@EXAMPLE.COM",
        name: "Uppercase User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites: any[] = [];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      const result = await getPendingInvitesService(userId);

      // Assert
      expect(result).toEqual([]);
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        "USER@EXAMPLE.COM"
      );
    });
  });

  describe("Function Call Verification", () => {
    it("should call each function exactly once", async () => {
      // Arrange
      const userId = "user-once";
      const mockUser = {
        id: userId,
        email: "once@example.com",
        name: "Once User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites: any[] = [];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      await getPendingInvitesService(userId);

      // Assert
      expect(mockGetUserByIdService).toHaveBeenCalledTimes(1);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledTimes(1);
    });

    it("should pass correct parameters to dependencies", async () => {
      // Arrange
      const userId = "user-params";
      const mockUser = {
        id: userId,
        email: "params@example.com",
        name: "Params User",
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockInvites: any[] = [];

      mockGetUserByIdService.mockResolvedValue(mockUser);
      mockGetPendingInvitesByEmailRepository.mockResolvedValue(mockInvites);

      // Act
      await getPendingInvitesService(userId);

      // Assert
      expect(mockGetUserByIdService).toHaveBeenCalledWith(userId);
      expect(mockGetPendingInvitesByEmailRepository).toHaveBeenCalledWith(
        mockUser.email
      );
    });
  });
});
