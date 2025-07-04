import { getCurrentUserId } from "@/services/users/get-current-user-id";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);

    // request.getUserMembershipOrganizationService = async (organizationSlug: string) =>
    //   await getUserMembershipOrganizationService(request, organizationSlug);
  });
});
