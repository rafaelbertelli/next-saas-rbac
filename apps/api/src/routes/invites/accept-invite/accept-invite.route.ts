import { authMiddleware } from "@/http/middlewares/auth";
import { acceptInviteService } from "@/services/invites/accept-invite/accept-invite.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { acceptInviteSchema } from "./schema";

export async function acceptInviteRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/invites/:inviteId/accept",
      {
        schema: acceptInviteSchema,
      },
      async (request, reply) => {
        const { inviteId } = request.params;

        const userId = await request.getCurrentUserId();
        await acceptInviteService({
          userId,
          inviteId,
        });

        return reply.status(204).send();
      }
    );
}
