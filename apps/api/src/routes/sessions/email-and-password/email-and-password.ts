import prisma from "@/infra/prisma/prisma-connection";
import { compare } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticateWithEmailAndPasswordSchema } from "./schema";

export async function authenticateWithEmailAndPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/email-and-password",
    {
      schema: authenticateWithEmailAndPasswordSchema,
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userFromEmail) {
        return reply.status(401).send({
          message: "Invalid credentials",
        });
      }

      if (userFromEmail.passwordHash === null) {
        return reply.status(401).send({
          message: "User does not have a password. Use social login.",
        });
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash
      );

      if (!isPasswordValid) {
        return reply.status(401).send({
          message: "Invalid credentials",
        });
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: "7d",
          },
        }
      );

      return reply.status(201).send({
        message: "Logged in successfully",
        data: {
          token,
        },
      });
    }
  );
}
