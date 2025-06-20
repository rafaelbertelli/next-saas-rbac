import { getUserByIdRepository } from "@/repositories/users/get-user-by-id";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getUserByIdService } from "./get-user-by-id.service";

jest.mock("@/repositories/users/get-user-by-id");

describe("getUserByIdService", () => {
  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user when found", async () => {
    // Arrange
    const userId = "user-123";
    (getUserByIdRepository as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const result = await getUserByIdService(userId);

    // Assert
    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockUser);
  });

  it("should throw NotFoundError when user is not found", async () => {
    // Arrange
    const userId = "non-existent-user";
    (getUserByIdRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getUserByIdService(userId)).rejects.toThrow(NotFoundError);
    await expect(getUserByIdService(userId)).rejects.toThrow("User not found");

    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
  });

  it("should return user with null avatarUrl when user has no avatar", async () => {
    // Arrange
    const userId = "user-123";
    const userWithoutAvatar = {
      ...mockUser,
      avatarUrl: null,
    };
    (getUserByIdRepository as jest.Mock).mockResolvedValue(userWithoutAvatar);

    // Act
    const result = await getUserByIdService(userId);

    // Assert
    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
    expect(result).toEqual(userWithoutAvatar);
    expect(result.avatarUrl).toBeNull();
  });

  it("should handle different user IDs correctly", async () => {
    // Arrange
    const differentUserId = "user-456";
    const differentUser = {
      id: "user-456",
      name: "Jane Smith",
      email: "jane@example.com",
      avatarUrl: "https://example.com/jane-avatar.jpg",
    };
    (getUserByIdRepository as jest.Mock).mockResolvedValue(differentUser);

    // Act
    const result = await getUserByIdService(differentUserId);

    // Assert
    expect(getUserByIdRepository).toHaveBeenCalledWith(differentUserId);
    expect(result).toEqual(differentUser);
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const userId = "user-123";
    (getUserByIdRepository as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(getUserByIdService(userId)).rejects.toThrow(
      "Database connection failed"
    );
    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
  });

  it("should handle empty string user ID", async () => {
    // Arrange
    const emptyUserId = "";
    (getUserByIdRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getUserByIdService(emptyUserId)).rejects.toThrow(
      NotFoundError
    );
    await expect(getUserByIdService(emptyUserId)).rejects.toThrow(
      "User not found"
    );

    expect(getUserByIdRepository).toHaveBeenCalledWith(emptyUserId);
  });

  it("should handle repository returning undefined", async () => {
    // Arrange
    const userId = "user-123";
    (getUserByIdRepository as jest.Mock).mockResolvedValue(undefined);

    // Act & Assert
    await expect(getUserByIdService(userId)).rejects.toThrow(NotFoundError);
    await expect(getUserByIdService(userId)).rejects.toThrow("User not found");

    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
  });

  it("should preserve all user properties returned by repository", async () => {
    // Arrange
    const userId = "user-123";
    const completeUser = {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    };
    (getUserByIdRepository as jest.Mock).mockResolvedValue(completeUser);

    // Act
    const result = await getUserByIdService(userId);

    // Assert
    expect(getUserByIdRepository).toHaveBeenCalledWith(userId);
    expect(result).toEqual(completeUser);
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});
