import { prisma } from "@/infra/prisma/prisma-connection";
import { ConflictError } from "@/routes/_error/4xx/conflict-error";
import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAccountSchema } from "./schema";

export const createUserAccountRoute = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: createAccountSchema,
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        throw new ConflictError("User already exists");
      }

      const [_, domain] = email.split("@");

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      });

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await hash(password, 10),
          ...(autoJoinOrganization && {
            memberships: {
              create: {
                organizationId: autoJoinOrganization.id,
              },
            },
          }),
        },
      });

      return reply.status(201).send({
        data: {
          user,
        },
      });
    }
  );
};
