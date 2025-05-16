import "fastify";

// import { Member, Organization } from "@/infra/prisma/prisma-connection";
// import { Member, Organization } from "@/generated/prisma"; // se for usar os tipos, eh com este q tem q ser usado // testar em prod

declare module "fastify" {
  interface FastifyRequest {
    getCurrentUserId: () => Promise<string>;
    // getUserMembershipOrganization: (organizationSlug: string) => Promise<{
    //   organization: Organization;
    //   membership: Member;
    // }>;
  }
}
