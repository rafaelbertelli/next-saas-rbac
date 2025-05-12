import prisma from "@/infra/prisma/prisma-connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { profileSchema } from "./schema";

export const profile = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/profile",
    {
      schema: profileSchema,
    },
    async (request, reply) => {
      const { sub } = await request.jwtVerify<{ sub: string }>();

      const user = await prisma.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          message: "User not found",
        });
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
