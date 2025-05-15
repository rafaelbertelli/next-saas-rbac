import { getMembership } from "@/services/organizations/get-membership";
import { getCurrentUserId } from "@/services/users/get-current-user-id";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);

    request.getUserMembership = async (organizationSlug: string) =>
      await getMembership(request, organizationSlug);
  });
});
