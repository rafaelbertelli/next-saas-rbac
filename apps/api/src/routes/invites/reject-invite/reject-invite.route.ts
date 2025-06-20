import { rejectInviteService } from "@/services/invites/reject-invite";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { rejectInviteSchema } from "./schema";

export async function rejectInviteRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/invites/:inviteId/reject",
    {
      schema: rejectInviteSchema,
    },
    async (request, reply) => {
      const { inviteId } = request.params;

      const userId = await request.getCurrentUserId();
      await rejectInviteService({
        inviteId,
        userId,
      });

      return reply.status(204).send();
    }
  );
}
