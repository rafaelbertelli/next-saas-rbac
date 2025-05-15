import { authMiddleware } from "@/http/middlewares/auth";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getOrganizationsByUserIdSchema } from "./schema";

import { getOrganizationsByUserIdService } from "@/services/organizations/get-organizations-by-user-id/get-organizations-by-user-id.service";
export async function getOrganizationsByUserIdRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations",
      {
        schema: getOrganizationsByUserIdSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const organizations = await getOrganizationsByUserIdService(userId);

        return res.status(200).send({
          message: "Organizations retrieved successfully",
          data: {
            organizations,
          },
        });
      }
    );
}
