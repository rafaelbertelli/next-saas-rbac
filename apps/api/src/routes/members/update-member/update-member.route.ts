import { authMiddleware } from "@/http/middlewares/auth";
import { updateMemberService } from "@/services/members/update-member/update-member.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateMemberSchema } from "./schema";

export async function updateMemberRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      "/organizations/:organizationSlug/members/:memberId",
      {
        schema: updateMemberSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { organizationSlug, memberId } = request.params;
        const { role } = request.body;

        await updateMemberService({
          userId,
          organizationSlug,
          memberId,
          role,
        });

        return reply.status(204).send();
      }
    );
}
