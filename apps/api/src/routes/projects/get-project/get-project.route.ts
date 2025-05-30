import { authMiddleware } from "@/http/middlewares/auth";
import { getProjectService } from "@/services/projects/get-project";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProjectSchema } from "./schema";

export async function getProjectRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:organizationSlug/projects/:projectSlug",
      {
        schema: getProjectSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const { organizationSlug, projectSlug } = req.params;

        const project = await getProjectService({
          userId,
          organizationSlug,
          projectSlug,
        });

        return res.status(200).send({
          message: "Project retrieved successfully",
          data: {
            name: project.name ?? "",
            description: project.description ?? "",
            avatarUrl: project.avatarUrl ?? "",
            id: project.id,
            slug: project.slug,
            ownerId: project.ownerId,
            organizationId: project.organizationId,
            owner: {
              id: project.owner.id,
              name: project.owner.name,
              email: project.owner.email,
              avatarUrl: project.owner.avatarUrl,
            },
          },
        });
      }
    );
}
