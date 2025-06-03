import { authMiddleware } from "@/http/middlewares/auth";
import { getMembersService } from "@/services/members/get-members";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getMembersSchema } from "./schema";

export async function getMembersRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:organizationSlug/members",
      {
        schema: getMembersSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { organizationSlug } = request.params;

        const members = await getMembersService({
          userId,
          organizationSlug,
        });

        return reply.status(200).send({
          message: "Members retrieved successfully",
          data: {
            members,
          },
        });
      }
    );
}
