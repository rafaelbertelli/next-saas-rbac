import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { FastifyRequest } from "fastify";

export async function getCurrentUserId(request: FastifyRequest) {
  try {
    const { sub } = await request.jwtVerify<{ sub: string }>();

    if (!sub) {
      throw new UnauthorizedError("Invalid token");
    }

    return sub;
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
}
