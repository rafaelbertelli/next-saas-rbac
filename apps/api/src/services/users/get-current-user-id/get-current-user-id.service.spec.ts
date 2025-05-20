import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { FastifyRequest } from "fastify";
import { getCurrentUserId } from "./get-current-user-id.service";

describe("getCurrentUserId", () => {
  it("should return the current user id when jwtVerify resolves with sub", async () => {
    // Arrange
    const request = {
      jwtVerify: jest.fn().mockResolvedValue({ sub: "123" }),
    } as unknown as FastifyRequest;

    // Act
    const userId = await getCurrentUserId(request);

    // Assert
    expect(userId).toBe("123");
    expect(request.jwtVerify).toHaveBeenCalled();
  });

  it("should throw UnauthorizedError if jwtVerify rejects", async () => {
    // Arrange
    const request = {
      jwtVerify: jest.fn().mockRejectedValue(new Error("Invalid token")),
    } as unknown as FastifyRequest;

    // Act & Assert
    await expect(getCurrentUserId(request)).rejects.toThrow(UnauthorizedError);
    await expect(getCurrentUserId(request)).rejects.toThrow("Invalid token");
    expect(request.jwtVerify).toHaveBeenCalled();
  });

  it("should throw UnauthorizedError if jwtVerify does not return sub", async () => {
    // Arrange
    const request = {
      jwtVerify: jest.fn().mockResolvedValue({}),
    } as unknown as FastifyRequest;

    // Act & Assert
    await expect(getCurrentUserId(request)).rejects.toThrow(UnauthorizedError);
    await expect(getCurrentUserId(request)).rejects.toThrow("Invalid token");
    expect(request.jwtVerify).toHaveBeenCalled();
  });
});
