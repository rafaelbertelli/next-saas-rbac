import { authMiddleware } from "@/http/middlewares/auth";
import { getPendingInvitesService } from "@/services/invites/get-pending-invites";
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
        const invites = await getPendingInvitesService(userId);

        return reply.status(200).send({
          message: "Pending invites retrieved successfully",
          data: {
            invites,
          },
        });
      }
    );
}
