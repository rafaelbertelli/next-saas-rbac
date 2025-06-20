import { authMiddleware } from "@/http/middlewares/auth";
import { prisma } from "@/infra/prisma/prisma-connection";
import { getPendingInvitesService } from "@/services/invites/get-pending-invites.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getPendingInvitesSchema } from "./schema";

export async function getPendingInvitesRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/invites/pending",
      {
        schema: getPendingInvitesSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();

        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const invites = await getPendingInvitesService(user.email);

        return reply.status(200).send({
          message: "Pending invites retrieved successfully",
          data: {
            invites,
          },
        });
      }
    );
}
