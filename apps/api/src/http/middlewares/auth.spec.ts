import { getCurrentUserId } from "@/services/auth/get-current-user-id";
import { getUserMembership } from "@/services/auth/get-user-membership";
import { FastifyInstance } from "fastify";
import { authMiddleware } from "./auth";

jest.mock("@/services/auth/get-current-user-id");
jest.mock("@/services/auth/get-user-membership");

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

  it("should add getCurrentUserId and getUserMembership to request", async () => {
    // Arrange
    const request: any = {};
    const reply: any = {};

    // Act
    await preHandler(request, reply);

    // Assert
    expect(typeof request.getCurrentUserId).toBe("function");
    expect(typeof request.getUserMembership).toBe("function");
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

  it("should call getUserMembership service when request.getUserMembership is called", async () => {
    // Arrange
    const request: any = {};
    const reply: any = {};
    const mockMembership = { organization: {}, membership: {} };
    (getUserMembership as jest.Mock).mockResolvedValue(mockMembership);

    await preHandler(request, reply);

    // Act
    const result = await request.getUserMembership("org-slug");

    // Assert
    expect(getUserMembership).toHaveBeenCalledWith(request, "org-slug");
    expect(result).toBe(mockMembership);
  });
});
