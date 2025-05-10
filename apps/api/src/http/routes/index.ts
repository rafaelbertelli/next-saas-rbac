import { FastifyInstance } from "fastify";
import { createAccount } from "./auth/users/create-account";

export async function routes(app: FastifyInstance) {
  createAccount(app);
}
