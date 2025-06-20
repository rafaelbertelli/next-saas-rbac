import { authMiddleware } from "@/http/middlewares/auth";
import { getInvitesByOrganizationService } from "@/services/invites/get-invites-by-organization";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getInvitesSchema } from "./schema";

export async function getInvitesRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:slug/invites",
      {
        schema: getInvitesSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { slug } = request.params;

        const invites = await getInvitesByOrganizationService({
          organizationSlug: slug,
          userId,
        });

        return reply.status(200).send({
          message: "Invites retrieved successfully",
          data: {
            invites,
          },
        });
      }
    );
}
