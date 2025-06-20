import { getOrganizationsByUserIdRepository } from "@/repositories/organizations/get-organizations-by-user-id";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { getOrganizationsByUserIdService } from "./";

jest.mock("@/repositories/organizations/get-organizations-by-user-id");

describe("getOrganizationsByUserIdService", () => {
  const userId = "user-1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return organizations for the user", async () => {
    const mockOrganizations = [
      {
        id: "org-1",
        name: "Org 1",
        slug: "org-1",
        domain: "org1.com",
        avatarUrl: null,
        role: "ADMIN",
      },
    ];
    (getOrganizationsByUserIdRepository as jest.Mock).mockResolvedValueOnce(
      mockOrganizations
    );

    const result = await getOrganizationsByUserIdService(userId);

    expect(getOrganizationsByUserIdRepository).toHaveBeenCalledWith(userId);
    expect(result).toBe(mockOrganizations);
  });

  it("should throw NotFoundError if organizations is null", async () => {
    (getOrganizationsByUserIdRepository as jest.Mock).mockResolvedValueOnce(
      null
    );

    await expect(getOrganizationsByUserIdService(userId)).rejects.toThrow(
      NotFoundError
    );
    await expect(getOrganizationsByUserIdService(userId)).rejects.toThrow(
      "Organizations not found"
    );
  });

  it("should throw NotFoundError if organizations is undefined", async () => {
    (getOrganizationsByUserIdRepository as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    await expect(getOrganizationsByUserIdService(userId)).rejects.toThrow(
      NotFoundError
    );
    await expect(getOrganizationsByUserIdService(userId)).rejects.toThrow(
      "Organizations not found"
    );
  });

  it("should propagate errors from the repository", async () => {
    (getOrganizationsByUserIdRepository as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    await expect(getOrganizationsByUserIdService(userId)).rejects.toThrow(
      "DB error"
    );
  });
});
