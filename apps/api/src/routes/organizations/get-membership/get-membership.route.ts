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

      const { organization, membership } =
        await request.getUserMembership(slug);

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
