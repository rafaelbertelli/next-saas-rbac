import { authMiddleware } from "@/http/middlewares/auth";
import { revokeInviteService } from "@/services/invites/revoke-invite";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { revokeInviteSchema } from "./schema";

export async function revokeInviteRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/organizations/:slug/invites/:inviteId",
      {
        schema: revokeInviteSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { slug, inviteId } = request.params;

        await revokeInviteService({
          inviteId,
          organizationSlug: slug,
          userId,
        });

        return reply.status(204).send();
      }
    );
}
