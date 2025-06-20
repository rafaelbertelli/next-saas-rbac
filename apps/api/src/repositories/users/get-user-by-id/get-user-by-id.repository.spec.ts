import { prisma } from "@/infra/prisma/prisma-connection";
import { getUserByIdRepository } from "./get-user-by-id.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getUserByIdRepository", () => {
  const userId = "user-123";

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
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    // Act
    const result = await getUserByIdRepository(userId);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    expect(result).toEqual(mockUser);
  });

  it("should return null when user is not found", async () => {
    // Arrange
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Act
    const result = await getUserByIdRepository(userId);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    expect(result).toBeNull();
  });

  it("should return user with null avatarUrl when user has no avatar", async () => {
    // Arrange
    const mockUserWithoutAvatar = {
      ...mockUser,
      avatarUrl: null,
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(
      mockUserWithoutAvatar
    );

    // Act
    const result = await getUserByIdRepository(userId);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    expect(result).toEqual(mockUserWithoutAvatar);
    expect(result?.avatarUrl).toBeNull();
  });

  it("should throw 'Failed to get user by id' when prisma throws an error", async () => {
    // Arrange
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(getUserByIdRepository(userId)).rejects.toThrow(
      "Failed to get user by id"
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
  });

  it("should handle different user IDs correctly", async () => {
    // Arrange
    const differentUserId = "user-456";
    const differentMockUser = {
      id: "user-456",
      name: "Jane Smith",
      email: "jane@example.com",
      avatarUrl: "https://example.com/jane-avatar.jpg",
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(differentMockUser);

    // Act
    const result = await getUserByIdRepository(differentUserId);

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: differentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });
    expect(result).toEqual(differentMockUser);
  });
});
