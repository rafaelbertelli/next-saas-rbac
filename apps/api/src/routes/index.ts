import { FastifyInstance } from "fastify";
import { authenticateWithEmailAndPassword } from "./sessions/email-and-password";
import { createAccount } from "./users/create-account";
import { profile } from "./users/profile";

export async function routes(app: FastifyInstance) {
  authenticateWithEmailAndPassword(app);
  createAccount(app);
  profile(app);
}
