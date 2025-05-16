import { authMiddleware } from "@/http/middlewares/auth";
import { shutdownOrganizationService } from "@/services/organizations/shutdown-organization/shutdown-organization.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { shutdownOrganizationSchema } from "./schema";

export async function shutdownOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      "/organizations/:slug",
      {
        schema: shutdownOrganizationSchema,
      },
      async (req, res) => {
        const { slug } = req.params;

        const userId = await req.getCurrentUserId();

        const data = await shutdownOrganizationService({ slug, userId });
        console.log(data);
        debugger;

        return res.status(204).send();
      }
    );
}
