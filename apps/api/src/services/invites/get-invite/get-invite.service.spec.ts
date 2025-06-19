import { getInviteByIdRepository } from "@/repositories/invites/get-invite/get-invite-by-id.repository";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getInviteService } from "./get-invite.service";

jest.mock("@/repositories/invites/get-invite/get-invite-by-id.repository");

describe("getInviteService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return invite when found", async () => {
    // Arrange
    const inviteId = "invite-123";
    const mockInvite = {
      id: "invite-123",
      email: "test@example.com",
      role: "MEMBER",
      status: "PENDING",
      organizationId: "org-123",
      authorId: "user-123",
      createdAt: new Date(),
    };

    (getInviteByIdRepository as jest.Mock).mockResolvedValue(mockInvite);

    // Act
    const result = await getInviteService(inviteId);

    // Assert
    expect(getInviteByIdRepository).toHaveBeenCalledWith(inviteId);
    expect(result).toEqual(mockInvite);
  });

  it("should throw NotFoundError when invite not found", async () => {
    // Arrange
    const inviteId = "non-existent-invite";
    (getInviteByIdRepository as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getInviteService(inviteId)).rejects.toThrow(NotFoundError);
    await expect(getInviteService(inviteId)).rejects.toThrow(
      "Invite not found"
    );

    expect(getInviteByIdRepository).toHaveBeenCalledWith(inviteId);
  });
});
