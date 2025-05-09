import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export const createAccount = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/users",
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;

      return {
        name,
        email,
        password,
      };
    }
  );
};
