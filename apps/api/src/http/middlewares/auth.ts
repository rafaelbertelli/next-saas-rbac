import { getCurrentUserId } from "@/services/auth/get-current-user-id";
import { getUserMembership } from "@/services/auth/get-user-membership";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authMiddleware = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("preHandler", async (request, reply) => {
    request.getCurrentUserId = async () => await getCurrentUserId(request);

    request.getUserMembership = async (organizationSlug: string) =>
      await getUserMembership(request, organizationSlug);
  });
});
