import prisma from "@/lib/prisma/prisma-connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const listUsers = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get("/users", async (_, reply) => {
    const users = await prisma.user.findMany();

    return reply.status(200).send({
      message: "Users fetched successfully",
      data: users,
    });
  });
};
