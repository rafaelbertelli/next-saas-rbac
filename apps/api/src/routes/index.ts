import { FastifyInstance } from "fastify";
import { authenticateWithEmailAndPassword } from "./session/authenticate-with-email-and-password";
import { passwordRecover } from "./session/password-recover";
import { createUserAccount } from "./users/create-user-account";
import { userProfile } from "./users/user-profile";

export async function routes(app: FastifyInstance) {
  // Authentication
  authenticateWithEmailAndPassword(app);
  passwordRecover(app);

  // Users
  createUserAccount(app);
  userProfile(app);
}
