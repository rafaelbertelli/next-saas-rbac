import { authMiddleware } from "@/http/middlewares/auth";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getOrganizationSchema } from "./schema";

export async function createOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:organizationId",
      {
        schema: getOrganizationSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const { organizationId } = req.params;

        const organization =
          await getOrganizationByIdRepository(organizationId);

        return res.status(200).send({
          message: "Organization retrieved successfully",
          data: {
            organization,
          },
        });
      }
    );
}
