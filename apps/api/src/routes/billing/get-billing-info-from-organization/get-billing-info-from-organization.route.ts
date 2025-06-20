import { authMiddleware } from "@/http/middlewares/auth";
import { getBillingInfoFromOrganizationService } from "@/services/billing/get-billing-info-from-organization/get-billing-info-from-organization.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getBillingInfoFromOrganizationSchema } from "./schema";

export async function getBillingInfoFromOrganizationRoute(
  app: FastifyInstance
) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      "/organizations/:slug/billing",
      {
        schema: getBillingInfoFromOrganizationSchema,
      },
      async (req, res) => {
        const { slug } = req.params;
        const userId = await req.getCurrentUserId();

        const billingInfo = await getBillingInfoFromOrganizationService({
          userId,
          organizationSlug: slug,
        });

        return res.status(200).send({
          message: "Billing information retrieved successfully",
          data: billingInfo,
        });
      }
    );
}
