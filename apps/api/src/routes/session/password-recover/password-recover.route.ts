import { prisma } from "@/infra/prisma/prisma-connection";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { passwordRecoverSchema } from "./schema";

export async function passwordRecoverRoute(app: FastifyInstance) {
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

      if (!userFromEmail) {
        request.log.error({
          message: "User not found",
          email,
        });

        // we don't want to tell the user that the email is not registered
        return reply.status(204).send();
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
      console.warn(">>>>>>", token.id, "<<<<<<");

      return reply.status(204).send();
    }
  );
}
