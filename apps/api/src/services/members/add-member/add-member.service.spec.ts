import { Role } from "@/generated/prisma";
import { addMemberRepository } from "@/repositories/members/add-member";
import { addMemberService } from "./add-member.service";

jest.mock("@/repositories/members/add-member");

describe("addMemberService", () => {
  const mockMember = {
    id: "member-123",
    userId: "user-123",
    organizationId: "org-123",
    role: "MEMBER" as Role,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
    },
    organization: {
      id: "org-123",
      name: "Test Organization",
      slug: "test-org",
    },
  };

  const mockTransaction = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add member with MEMBER role and return member", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER" as Role,
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(mockMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
      tx: undefined,
    });
    expect(result).toEqual(mockMember);
  });

  it("should add member with ADMIN role and return member", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "ADMIN" as Role,
    };

    const adminMember = {
      ...mockMember,
      role: "ADMIN" as Role,
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(adminMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "ADMIN",
      tx: undefined,
    });
    expect(result).toEqual(adminMember);
  });

  it("should add member with BILLING role and return member", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "BILLING" as Role,
    };

    const billingMember = {
      ...mockMember,
      role: "BILLING" as Role,
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(billingMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "BILLING",
      tx: undefined,
    });
    expect(result).toEqual(billingMember);
  });

  it("should use transaction when provided", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER" as Role,
      tx: mockTransaction,
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(mockMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
      tx: mockTransaction,
    });
    expect(result).toEqual(mockMember);
  });

  it("should handle different user and organization IDs correctly", async () => {
    // Arrange
    const input = {
      userId: "user-456",
      organizationId: "org-456",
      role: "MEMBER" as Role,
    };

    const differentMember = {
      ...mockMember,
      userId: "user-456",
      organizationId: "org-456",
      user: {
        ...mockMember.user,
        id: "user-456",
        name: "Jane Smith",
        email: "jane@example.com",
      },
      organization: {
        ...mockMember.organization,
        id: "org-456",
        name: "Another Organization",
        slug: "another-org",
      },
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(differentMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-456",
      organizationId: "org-456",
      role: "MEMBER",
      tx: undefined,
    });
    expect(result).toEqual(differentMember);
  });

  it("should return member with complete user and organization data", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER" as Role,
    };

    const completeMember = {
      ...mockMember,
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: null, // Test null avatar
      },
      organization: {
        id: "org-123",
        name: "Complete Organization",
        slug: "complete-org",
      },
    };

    (addMemberRepository as jest.Mock).mockResolvedValue(completeMember);

    // Act
    const result = await addMemberService(input);

    // Assert
    expect(result.user).toEqual({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      avatarUrl: null,
    });
    expect(result.organization).toEqual({
      id: "org-123",
      name: "Complete Organization",
      slug: "complete-org",
    });
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER" as Role,
    };

    (addMemberRepository as jest.Mock).mockRejectedValue(
      new Error("Failed to add member")
    );

    // Act & Assert
    await expect(addMemberService(input)).rejects.toThrow(
      "Failed to add member"
    );
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
      tx: undefined,
    });
  });

  it("should throw error when repository throws with transaction", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER" as Role,
      tx: mockTransaction,
    };

    (addMemberRepository as jest.Mock).mockRejectedValue(
      new Error("Transaction failed")
    );

    // Act & Assert
    await expect(addMemberService(input)).rejects.toThrow("Transaction failed");
    expect(addMemberRepository).toHaveBeenCalledWith({
      userId: "user-123",
      organizationId: "org-123",
      role: "MEMBER",
      tx: mockTransaction,
    });
  });
});
