import { FastifyInstance } from "fastify";
import { createAccount } from "./auth/create-account";

export async function routes(app: FastifyInstance) {
  createAccount(app);
}
