import { UnauthorizedError } from "@/routes/_error/4xx/unauthorized-error";
import { getMembershipBySlugService } from "@/services/members/get-membership-by-slug.service";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();

        return sub;
      } catch (error) {
        throw new UnauthorizedError("Invalid token");
      }
    };

    request.getUserMembership = async (organizationSlug: string) => {
      const userId = await request.getCurrentUserId();
      const member = await getMembershipBySlugService({
        userId,
        organizationSlug,
      });
      const { organization, ...membership } = member;

      return {
        organization,
        membership,
      };
    };
  });
});
