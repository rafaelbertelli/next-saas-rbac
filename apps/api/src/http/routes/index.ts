import { FastifyInstance } from "fastify";
import { createAccount } from "./auth/create-account";
import { listUsers } from "./auth/list-account";

export async function routes(app: FastifyInstance) {
  createAccount(app);
  listUsers(app);
}
