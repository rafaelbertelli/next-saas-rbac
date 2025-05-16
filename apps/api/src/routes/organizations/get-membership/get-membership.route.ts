import { getUserMembershipOrganization } from "@/services/membership/get-user-membership-organization";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetMembershipSchema } from "./schema";

export function getMembershipRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/organizations/:slug/membership",
    {
      schema: GetMembershipSchema,
    },
    async (request, reply) => {
      const { slug } = request.params;
      const userId = await request.getCurrentUserId();

      const { organization, membership } = await getUserMembershipOrganization({
        organizationSlug: slug,
        userId,
      });

      return reply.status(200).send({
        message: "Membership retrieved successfully",
        data: {
          membership,
          organization,
        },
      });
    }
  );
}
