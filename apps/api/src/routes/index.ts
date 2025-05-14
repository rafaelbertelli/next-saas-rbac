import { FastifyInstance } from "fastify";
import { authenticateWithEmailAndPassword } from "./session/authenticate-with-email-and-password";
import { authenticateWithGithub } from "./session/authenticate-with-github";
import { passwordRecover } from "./session/password-recover";
import { resetPassword } from "./session/reset-password";
import { createUserAccount } from "./users/create-user-account";
import { userProfile } from "./users/user-profile";

export async function routes(app: FastifyInstance) {
  // Authentication
  authenticateWithEmailAndPassword(app);
  authenticateWithGithub(app);
  passwordRecover(app);
  resetPassword(app);

  // Users
  createUserAccount(app);
  userProfile(app);
}
