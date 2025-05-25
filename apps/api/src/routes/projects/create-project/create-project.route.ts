import { authMiddleware } from "@/http/middlewares/auth";
import { createProjectService } from "@/services/projects/create-project/create-project.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProjectSchema } from "./schema";

export async function createProjectRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/organizations/:slug/projects",
      {
        schema: createProjectSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const { slug } = req.params;
        const { name, description } = req.body;

        const project = await createProjectService({
          userId,
          slug,
          name,
          description,
        });

        return res.status(201).send({
          message: "Project created successfully",
          data: { projectId: project.id },
        });
      }
    );
}
