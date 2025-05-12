import { authMiddleware } from "@/http/middlewares/auth";
import prisma from "@/infra/prisma/prisma-connection";
import { NotFoundError } from "@/routes/_error/4xx/not-found-error";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { profileSchema } from "./schema";

export const profile = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/users/profile",
      {
        schema: profileSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        const user = await prisma.user.findUnique({
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new NotFoundError("User not found");
        }

        return reply.status(200).send({
          message: "success",
          data: {
            user,
          },
        });
      }
    );
};
