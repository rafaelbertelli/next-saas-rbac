import { authMiddleware } from "@/http/middlewares/auth";
import { transferOrganizationService } from "@/services/organizations/transfer-organization/transfer-organization.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { transferOrganizationSchema } from "./schema";

export async function transferOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      "/organizations/:slug/owner",
      {
        schema: transferOrganizationSchema,
      },
      async (req, res) => {
        const { slug } = req.params;
        const { transferToUserId } = req.body;

        const userId = await req.getCurrentUserId();

        const data = await transferOrganizationService({
          slug,
          userId,
          transferToUserId,
        });

        console.log(data);

        return res.status(204).send();
      }
    );
}
