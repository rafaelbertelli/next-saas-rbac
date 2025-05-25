import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { BadRequestError } from "./4xx/bad-request-error";
import { ConflictError } from "./4xx/conflict-error";
import { ForbiddenError } from "./4xx/forbidden-error";
import { NotFoundError } from "./4xx/not-found-error";
import { UnauthorizedError } from "./4xx/unauthorized-error";
import { BadGatewayError } from "./5xx/bad-gateway-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

// Helper function to transform Zod errors into a more readable format
function transformZodErrors(error: ZodError): Record<string, string> {
  return error.errors.reduce(
    (acc, issue) => {
      const key = issue.path.join(".");
      acc[key] = issue.message;
      return acc;
    },
    {} as Record<string, string>
  );
}

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Handle Zod validation errors using the recommended approach
  if (hasZodFastifySchemaValidationErrors(error)) {
    // Transform validation errors into field: message format
    const fieldErrors = error.validation.reduce(
      (acc, issue: any) => {
        const key =
          issue.instancePath?.replace(/^\//, "").replace(/\//g, ".") ||
          issue.params?.missingProperty ||
          "root";
        acc[key] = issue.message || `Invalid value`;
        return acc;
      },
      {} as Record<string, string>
    );

    return reply.status(400).send({
      message: "Validation failed",
      errors: fieldErrors,
    });
  }

  // Handle direct ZodError instances (for manual validation)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Validation Error",
      message: "Validation failed",
      statusCode: 400,
      errors: transformZodErrors(error),
    });
  }

  if (error instanceof BadRequestError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof ConflictError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof ForbiddenError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof NotFoundError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  request.log.error(error);

  if (error instanceof BadGatewayError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: "Internal server error",
  });
};
