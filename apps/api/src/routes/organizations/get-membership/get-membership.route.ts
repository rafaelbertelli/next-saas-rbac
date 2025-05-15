import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetMembershipSchema } from "./schema";

export function getMembershipRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/organizations/:organizationSlug/membership",
    {
      schema: GetMembershipSchema,
    },
    async (request, reply) => {
      const organizationSlug = request.params.organizationSlug;

      const { organization, membership } =
        await request.getUserMembership(organizationSlug);

      return reply.status(200).send({
        message: "Membership retrieved successfully",
        data: {
          membership: {
            id: membership.id,
            role: membership.role,
          },
          organization: {
            id: organization.id,
            name: organization.name,
          },
        },
      });
    }
  );
}
