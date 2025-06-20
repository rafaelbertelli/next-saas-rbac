import { Role } from "@/generated/prisma";
import { prisma } from "@/infra/prisma/prisma-connection";
import { addMemberRepository } from "./add-member.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    member: {
      create: jest.fn(),
    },
  },
}));

describe("addMemberRepository", () => {
  const mockMember = {
    id: "member-1",
    userId: "user-1",
    organizationId: "org-1",
    role: "MEMBER" as Role,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
    },
    organization: {
      id: "org-1",
      name: "Test Organization",
      slug: "test-org",
    },
  };

  const mockTransaction = {
    member: {
      create: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a member with MEMBER role and return it", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "MEMBER" as Role,
    };

    (prisma.member.create as jest.Mock).mockResolvedValue(mockMember);

    // Act
    const result = await addMemberRepository(input);

    // Assert
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(result).toEqual(mockMember);
  });

  it("should add a member with ADMIN role and return it", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "ADMIN" as Role,
    };

    const mockAdminMember = {
      ...mockMember,
      role: "ADMIN" as Role,
    };

    (prisma.member.create as jest.Mock).mockResolvedValue(mockAdminMember);

    // Act
    const result = await addMemberRepository(input);

    // Assert
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(result).toEqual(mockAdminMember);
  });

  it("should add a member with BILLING role and return it", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "BILLING" as Role,
    };

    const mockBillingMember = {
      ...mockMember,
      role: "BILLING" as Role,
    };

    (prisma.member.create as jest.Mock).mockResolvedValue(mockBillingMember);

    // Act
    const result = await addMemberRepository(input);

    // Assert
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(result).toEqual(mockBillingMember);
  });

  it("should use transaction when provided", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "MEMBER" as Role,
      tx: mockTransaction,
    };

    mockTransaction.member.create.mockResolvedValue(mockMember);

    // Act
    const result = await addMemberRepository(input);

    // Assert
    expect(mockTransaction.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(prisma.member.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockMember);
  });

  it("should throw 'Failed to add member' when prisma throws an error", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "MEMBER" as Role,
    };

    (prisma.member.create as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    // Act & Assert
    await expect(addMemberRepository(input)).rejects.toThrow(
      "Failed to add member"
    );
    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  });

  it("should throw 'Failed to add member' when transaction throws an error", async () => {
    // Arrange
    const input = {
      userId: "user-1",
      organizationId: "org-1",
      role: "MEMBER" as Role,
      tx: mockTransaction,
    };

    mockTransaction.member.create.mockRejectedValue(
      new Error("Transaction failed")
    );

    // Act & Assert
    await expect(addMemberRepository(input)).rejects.toThrow(
      "Failed to add member"
    );
    expect(mockTransaction.member.create).toHaveBeenCalledWith({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    expect(prisma.member.create).not.toHaveBeenCalled();
  });
});
