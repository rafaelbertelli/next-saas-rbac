import prisma from "@/infra/prisma/prisma-connection";
import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createAccountSchema } from "./schema";

export const createAccount = async (app: FastifyInstance) => {
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
        return reply.status(409).send({
          message: "User with same email already exists",
        });
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
        message: "success",
        data: {
          user,
        },
      });
    }
  );
};
