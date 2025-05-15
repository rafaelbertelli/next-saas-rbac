import { authMiddleware } from "@/http/middlewares/auth";
import { getOrganizationBySlugService } from "@/services/organizations/get-organization-by-slug";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getOrganizationSchema } from "./schema";

export async function getOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:slug",
      {
        schema: getOrganizationSchema,
      },
      async (req, res) => {
        const { slug } = req.params;

        const organization = await getOrganizationBySlugService(slug);

        return res.status(200).send({
          message: "Organization retrieved successfully",
          data: {
            organization,
          },
        });
      }
    );
}
