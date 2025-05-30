import { authMiddleware } from "@/http/middlewares/auth";
import { getProjectsService } from "@/services/projects/get-projects";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProjectsSchema } from "./schema";

export async function getProjectsRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:organizationSlug/projects",
      {
        schema: getProjectsSchema,
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const { organizationSlug } = request.params;

        const projects = await getProjectsService({
          userId,
          organizationSlug,
        });

        return reply.status(200).send({
          message: "Projects retrieved successfully",
          data: {
            projects,
          },
        });
      }
    );
}
