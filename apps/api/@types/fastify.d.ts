import "fastify";

// import { Member, Organization } from "@/infra/prisma/prisma-connection";
import { Member, Organization } from "@/generated/prisma";

declare module "fastify" {
  interface FastifyRequest {
    getCurrentUserId: () => Promise<string>;
    getUserMembership: (organizationSlug: string) => Promise<{
      organization: Organization;
      membership: Member;
    }>;
  }
}
