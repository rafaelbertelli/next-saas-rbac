import { authMiddleware } from "@/http/middlewares/auth";
import { updateOrganizationService } from "@/services/organizations/update-organization";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateOrganizationSchema } from "./schema";

export async function updateOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .put(
      "/organizations/:slug",
      {
        schema: updateOrganizationSchema,
      },
      async (req, res) => {
        const { slug } = req.params;
        const { name, domain, shouldAttachUsersByDomain } = req.body;

        const userId = await req.getCurrentUserId();

        await updateOrganizationService({
          name,
          domain,
          slug,
          shouldAttachUsersByDomain,
          userId,
        });

        return res.status(204).send();
      }
    );
}
