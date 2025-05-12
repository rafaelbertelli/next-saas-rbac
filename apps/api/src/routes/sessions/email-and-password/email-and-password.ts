import prisma from "@/infra/prisma/prisma-connection";
import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
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
        throw new UnauthorizedError("Invalid credentials");
      }

      if (userFromEmail.passwordHash === null) {
        throw new UnauthorizedError(
          "User does not have a password. Use social login."
        );
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash
      );

      if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      const token = await reply.jwtSign(
        { sub: userFromEmail.id },
        { sign: { expiresIn: "7d" } }
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
