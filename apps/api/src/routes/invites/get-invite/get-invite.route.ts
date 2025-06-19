import { getInviteService } from "@/services/invites/get-invite";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getInvitesSchema } from "./schema";

export async function getInviteRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/invites/:inviteId",
    {
      schema: getInvitesSchema,
    },
    async (request, reply) => {
      const { inviteId } = request.params;

      const invite = await getInviteService(inviteId);

      return reply.status(200).send({
        message: "Invites retrieved successfully",
        data: {
          invite,
        },
      });
    }
  );
}
