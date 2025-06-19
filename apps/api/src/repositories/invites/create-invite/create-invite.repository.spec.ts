import { prisma } from "@/infra/prisma/prisma-connection";
import { createInviteRepository } from "./create-invite.repository";

jest.mock("@/infra/prisma/prisma-connection", () => ({
  prisma: {
    invite: {
      create: jest.fn(),
    },
  },
}));

describe("createInviteRepository", () => {
  const mockInvite = {
    id: "invite-1",
    email: "test@example.com",
    role: "MEMBER" as const,
    status: "PENDING" as const,
    organizationId: "org-1",
    inviterId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an invite and return it", async () => {
    // Arrange
    const input = {
      email: "test@example.com",
      role: "MEMBER" as const,
      organizationId: "org-1",
      inviterId: "user-1",
    };

    (prisma.invite.create as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await createInviteRepository(input);

    // Assert
    expect(prisma.invite.create).toHaveBeenCalledWith({
      data: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        inviterId: input.inviterId,
        status: "PENDING",
      },
    });
    expect(result).toEqual(mockInvite);
  });

  it("should throw 'Failed to create invite' if prisma throws", async () => {
    // Arrange
    const input = {
      email: "test@example.com",
      role: "MEMBER" as const,
      organizationId: "org-1",
      inviterId: "user-1",
    };

    jest
      .mocked(prisma.invite.create)
      .mockRejectedValueOnce(new Error("Database connection failed"));

    // Act & Assert
    await expect(createInviteRepository(input)).rejects.toThrow(
      "Failed to create invite"
    );
    expect(prisma.invite.create).toHaveBeenCalledWith({
      data: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        inviterId: input.inviterId,
        status: "PENDING",
      },
    });
  });

  it("should create invite with ADMIN role", async () => {
    // Arrange
    const input = {
      email: "admin@example.com",
      role: "ADMIN" as const,
      organizationId: "org-1",
      inviterId: "user-1",
    };

    const mockAdminInvite = {
      ...mockInvite,
      email: "admin@example.com",
      role: "ADMIN" as const,
    };

    (prisma.invite.create as jest.Mock).mockResolvedValue(mockAdminInvite);

    // Act
    const result = await createInviteRepository(input);

    // Assert
    expect(prisma.invite.create).toHaveBeenCalledWith({
      data: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        inviterId: input.inviterId,
        status: "PENDING",
      },
    });
    expect(result).toEqual(mockAdminInvite);
  });

  it("should create invite with BILLING role", async () => {
    // Arrange
    const input = {
      email: "billing@example.com",
      role: "BILLING" as const,
      organizationId: "org-1",
      inviterId: "user-1",
    };

    const mockBillingInvite = {
      ...mockInvite,
      email: "billing@example.com",
      role: "BILLING" as const,
    };

    (prisma.invite.create as jest.Mock).mockResolvedValue(mockBillingInvite);

    // Act
    const result = await createInviteRepository(input);

    // Assert
    expect(prisma.invite.create).toHaveBeenCalledWith({
      data: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        inviterId: input.inviterId,
        status: "PENDING",
      },
    });
    expect(result).toEqual(mockBillingInvite);
  });
});
