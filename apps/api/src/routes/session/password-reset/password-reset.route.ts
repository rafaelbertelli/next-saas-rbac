import { prisma } from "@/infra/prisma/prisma-connection";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { resetPasswordSchema } from "./schema";

export async function passwordResetRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/session/password-reset",
    {
      schema: resetPasswordSchema,
    },
    async (request, reply) => {
      const { token, password } = request.body;

      const tokenFromDb = await prisma.token.findUnique({
        where: {
          id: token,
        },
      });

      if (
        !tokenFromDb ||
        tokenFromDb.used ||
        tokenFromDb.expiresAt < new Date()
      ) {
        request.log.error({
          message: "Invalid token",
          userId: tokenFromDb?.userId,
        });
        throw new UnauthorizedError("Invalid token");
      }

      const userFromToken = await prisma.user.findUnique({
        where: {
          id: tokenFromDb.userId,
        },
      });

      if (!userFromToken) {
        request.log.error({
          message: "User not found",
          userId: tokenFromDb.userId,
        });
        throw new NotFoundError("User not found");
      }

      const hashedPassword = await hash(password, 10);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id: userFromToken.id,
          },
          data: {
            passwordHash: hashedPassword,
          },
        });

        await tx.token.update({
          where: {
            id: tokenFromDb.id,
          },
          data: {
            used: true,
          },
        });
      });

      return reply.status(204).send();
    }
  );
}
