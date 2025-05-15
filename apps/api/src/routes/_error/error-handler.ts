import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { BadRequestError } from "./4xx/bad-request-error";
import { ConflictError } from "./4xx/conflict-error";
import { NotFoundError } from "./4xx/not-found-error";
import { UnauthorizedError } from "./4xx/unauthorized-error";
import { BadGatewayError } from "./5xx/bad-gateway-error";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      details: error.flatten().fieldErrors,
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
