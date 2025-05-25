import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { BadRequestError } from "./4xx/bad-request-error";
import { ConflictError } from "./4xx/conflict-error";
import { ForbiddenError } from "./4xx/forbidden-error";
import { NotFoundError } from "./4xx/not-found-error";
import { UnauthorizedError } from "./4xx/unauthorized-error";
import { BadGatewayError } from "./5xx/bad-gateway-error";
import { errorHandler } from "./error-handler";

jest.mock("fastify-type-provider-zod");

describe("errorHandler", () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      method: "POST",
      url: "/test-endpoint",
      log: {
        error: jest.fn(),
      },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("hasZodFastifySchemaValidationErrors", () => {
    it("should handle Zod schema validation errors with instancePath", () => {
      // Arrange
      const error = {
        validation: [
          {
            instancePath: "/email",
            message: "Invalid email format",
          },
          {
            instancePath: "/user/name",
            message: "Name is required",
          },
        ],
      };
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(true);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: {
          email: "Invalid email format",
          "user.name": "Name is required",
        },
      });
    });

    it("should handle Zod schema validation errors with missing property", () => {
      // Arrange
      const error = {
        validation: [
          {
            params: {
              missingProperty: "password",
            },
            message: "Missing required property",
          },
        ],
      };
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(true);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: {
          password: "Missing required property",
        },
      });
    });

    it("should handle Zod schema validation errors with root level errors", () => {
      // Arrange
      const error = {
        validation: [
          {
            message: "Invalid request format",
          },
        ],
      };
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(true);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: {
          root: "Invalid request format",
        },
      });
    });

    it("should handle Zod schema validation errors without message", () => {
      // Arrange
      const error = {
        validation: [
          {
            instancePath: "/field",
          },
        ],
      };
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(true);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: {
          field: "Invalid value",
        },
      });
    });
  });

  describe("ZodError instances", () => {
    it("should handle direct ZodError with simple path", () => {
      // Arrange
      const error = new ZodError([
        {
          code: "invalid_string",
          path: ["email"],
          message: "Invalid email address",
          validation: "email",
        },
      ]);
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Validation Error",
        message: "Validation failed",
        statusCode: 400,
        errors: {
          email: "Invalid email address",
        },
      });
    });

    it("should handle direct ZodError with nested path", () => {
      // Arrange
      const error = new ZodError([
        {
          code: "too_small",
          path: ["user", "profile", "name"],
          message: "Name must be at least 2 characters",
          minimum: 2,
          type: "string",
          inclusive: true,
        },
        {
          code: "invalid_type",
          path: ["age"],
          message: "Expected number, received string",
          expected: "number",
          received: "string",
        },
      ]);
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Validation Error",
        message: "Validation failed",
        statusCode: 400,
        errors: {
          "user.profile.name": "Name must be at least 2 characters",
          age: "Expected number, received string",
        },
      });
    });

    it("should handle direct ZodError with empty path", () => {
      // Arrange
      const error = new ZodError([
        {
          code: "custom",
          path: [],
          message: "Root level validation error",
        },
      ]);
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Validation Error",
        message: "Validation failed",
        statusCode: 400,
        errors: {
          "": "Root level validation error",
        },
      });
    });
  });

  describe("BadRequestError", () => {
    it("should handle BadRequestError", () => {
      // Arrange
      const error = new BadRequestError("Invalid request data");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Invalid request data",
      });
    });
  });

  describe("ConflictError", () => {
    it("should handle ConflictError", () => {
      // Arrange
      const error = new ConflictError("Resource already exists");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(409);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Resource already exists",
      });
    });
  });

  describe("ForbiddenError", () => {
    it("should handle ForbiddenError", () => {
      // Arrange
      const error = new ForbiddenError("Access denied");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Access denied",
      });
    });
  });

  describe("NotFoundError", () => {
    it("should handle NotFoundError", () => {
      // Arrange
      const error = new NotFoundError("Resource not found");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Resource not found",
      });
    });
  });

  describe("UnauthorizedError", () => {
    it("should handle UnauthorizedError", () => {
      // Arrange
      const error = new UnauthorizedError("Authentication required");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });
  });

  describe("BadGatewayError", () => {
    it("should handle BadGatewayError", () => {
      // Arrange
      const error = new BadGatewayError("External service unavailable");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.status).toHaveBeenCalledWith(502);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "External service unavailable",
      });
    });
  });

  describe("Generic errors", () => {
    it("should handle generic Error with 500 status", () => {
      // Arrange
      const error = new Error("Something went wrong");
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });

    it("should handle custom error objects with 500 status", () => {
      // Arrange
      const error = { message: "Custom error object" };
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });

    it("should handle null/undefined errors with 500 status", () => {
      // Arrange
      const error = null;
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("Error precedence", () => {
    it("should prioritize hasZodFastifySchemaValidationErrors over ZodError instance", () => {
      // Arrange
      const error = new ZodError([
        {
          code: "invalid_string" as any,
          path: ["email"],
          message: "Invalid email",
          validation: "email",
        },
      ]);

      // Mock to return true for hasZodFastifySchemaValidationErrors
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(true);
      (error as any).validation = [
        {
          instancePath: "/email",
          message: "Schema validation failed",
        },
      ];

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: {
          email: "Schema validation failed",
        },
      });
    });

    it("should handle ZodError instance when hasZodFastifySchemaValidationErrors returns false", () => {
      // Arrange
      const error = new ZodError([
        {
          code: "invalid_string" as any,
          path: ["email"],
          message: "Invalid email",
          validation: "email",
        },
      ]);
      jest.mocked(hasZodFastifySchemaValidationErrors).mockReturnValue(false);

      // Act
      errorHandler(error as any, mockRequest, mockReply);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Validation Error",
        message: "Validation failed",
        statusCode: 400,
        errors: {
          email: "Invalid email",
        },
      });
    });
  });
});
