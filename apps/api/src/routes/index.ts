import { FastifyInstance } from "fastify";

import { createOrganizationRoute } from "./organizations/create-organization";
import { getMembershipRoute } from "./organizations/get-membership";
import { getOrganizationRoute } from "./organizations/get-organization";
import { getOrganizationsByUserIdRoute } from "./organizations/get-organizations-by-user-id";
import { authenticateWithEmailAndPasswordRoute } from "./session/authenticate-with-email-and-password";
import { authenticateWithGithubRoute } from "./session/authenticate-with-github";
import { passwordRecoverRoute } from "./session/password-recover";
import { resetPasswordRoute } from "./session/reset-password";
import { createUserAccountRoute } from "./users/create-user-account";
import { userProfileRoute } from "./users/user-profile";

export async function routes(app: FastifyInstance) {
  // Authentication
  authenticateWithEmailAndPasswordRoute(app);
  authenticateWithGithubRoute(app);
  passwordRecoverRoute(app);
  resetPasswordRoute(app);

  // Users
  createUserAccountRoute(app);
  userProfileRoute(app);

  // Organizations
  createOrganizationRoute(app);
  getMembershipRoute(app);
  getOrganizationRoute(app);
  getOrganizationsByUserIdRoute(app);
}
