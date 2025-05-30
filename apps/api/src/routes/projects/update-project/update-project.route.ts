import { authMiddleware } from "@/http/middlewares/auth";
import { updateProjectService } from "@/services/projects/update-project";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateProjectSchema } from "./schema";

export async function updateProjectRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      "/organizations/:organizationSlug/projects/:projectId",
      {
        schema: updateProjectSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { organizationSlug, projectId } = request.params;
        const { name, description, avatarUrl } = request.body;

        const updatedProject = await updateProjectService({
          userId,
          organizationSlug,
          projectId,
          name,
          description,
          avatarUrl,
        });

        return reply.status(204).send();
      }
    );
}
