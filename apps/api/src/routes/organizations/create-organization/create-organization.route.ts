import { authMiddleware } from "@/http/middlewares/auth";
import { checkDuplicateOrganizationService } from "@/services/organizations/check-duplicate-organization.service";
import { createOrganizationService } from "@/services/organizations/create-organization.service";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createOrganizationSchema } from "./schema";

export async function createOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      "/organizations",
      {
        schema: createOrganizationSchema,
      },
      async (req, res) => {
        const userId = await req.getCurrentUserId();
        const { name, domain, shouldAttachUsersByDomain } = req.body;

        if (domain) {
          await checkDuplicateOrganizationService(domain);
        }

        const newOrganization = await createOrganizationService({
          userId,
          name,
          domain,
          shouldAttachUsersByDomain,
        });

        return res.status(201).send({
          message: "Organization created successfully",
          data: {
            organizationId: newOrganization.id,
          },
        });
      }
    );
}
