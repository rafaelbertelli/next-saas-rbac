import { getCurrentUserId } from "@/services/users/get-current-user-id";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "./auth";

jest.mock("@/services/users/get-current-user-id");
jest.mock("@/services/membership/get-user-membership-organization");

describe("authMiddleware", () => {
  let app: FastifyInstance;
  let preHandler: (request: any, reply: any) => Promise<void>;

  beforeEach(async () => {
    app = {
      addHook: jest.fn((hookName, fn) => {
        if (hookName === "preHandler") {
          preHandler = fn;
        }
      }),
    } as unknown as FastifyInstance;

    await authMiddleware(app);
  });

  it("should call getCurrentUserId service when request.getCurrentUserId is called", async () => {
    // Arrange
    const request: any = {};
    const reply: any = {};
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    await preHandler(request, reply);

    // Act
    const userId = await request.getCurrentUserId();

    // Assert
    expect(getCurrentUserId).toHaveBeenCalledWith(request);
    expect(userId).toBe("user-123");
  });
});
