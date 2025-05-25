import { authMiddleware } from "@/http/middlewares/auth";
import { deleteProjectService } from "@/services/projects/delete-project";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteProjectSchema } from "./schema";

export async function deleteProjectRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/organizations/:slug/projects/:projectId",
      {
        schema: deleteProjectSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const { slug, projectId } = req.params;

        const project = await deleteProjectService({
          userId,
          slug,
          projectId,
        });

        return res.status(204).send();
      }
    );
}
