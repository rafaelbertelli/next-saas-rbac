import prisma from "@/lib/prisma/prisma-connection";
import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export const createAccount = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        return reply.status(409).send({
          message: "User with same email already exists",
        });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await hash(password, 10),
        },
      });

      return reply.status(201).send({
        message: "User created successfully",
        data: user,
      });
    }
  );
};
