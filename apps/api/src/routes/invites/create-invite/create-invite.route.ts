import { authMiddleware } from "@/http/middlewares/auth";
import { createInviteService } from "@/services/invites/create-invite/create-invite.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createInviteSchema } from "./schema";

export async function createInviteRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/organizations/:slug/invites",
      {
        schema: createInviteSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { slug } = request.params;
        const { email, role } = request.body;

        const invite = await createInviteService({
          email,
          role,
          organizationSlug: slug,
          userId,
        });

        return reply.status(201).send({
          message: "Invite created successfully",
          data: {
            inviteId: invite.id,
          },
        });
      }
    );
}
