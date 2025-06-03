import { authMiddleware } from "@/http/middlewares/auth";
import { removeMemberService } from "@/services/members/remove-member/remove-member.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { removeMemberSchema } from "./schema";

export async function removeMemberRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/organizations/:organizationSlug/members/:memberId",
      {
        schema: removeMemberSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { organizationSlug, memberId } = request.params;

        await removeMemberService({
          userId,
          organizationSlug,
          memberId,
        });

        return reply.status(204).send();
      }
    );
}
