import prisma from "@/infra/prisma/prisma-connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { passwordRecoverSchema } from "./schema";

export async function passwordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/session/password-recover",
    {
      schema: passwordRecoverSchema,
    },
    async (request, reply) => {
      const { email } = request.body;

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      console.log(userFromEmail);

      if (!userFromEmail) {
        // we don't want to tell the user that the email is not registered
        return reply.status(201).send();
      }

      const expiresAt10Minutes = new Date(Date.now() + 1000 * 60 * 10);
      const token = await prisma.token.create({
        data: {
          userId: userFromEmail.id,
          type: "PASSWORD_RECOVER",
          expiresAt: expiresAt10Minutes,
        },
      });

      // send email to user with recover link
      console.log(
        `https://app.dev.workos.com/session/password-recover/${token.id}`
      );

      return reply.status(201).send();
    }
  );
}
