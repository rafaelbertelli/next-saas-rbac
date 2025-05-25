import { FastifyInstance } from "fastify";

import { createOrganizationRoute } from "./organizations/create-organization";
import { getMembershipRoute } from "./organizations/get-membership";
import { getOrganizationRoute } from "./organizations/get-organization";
import { getOrganizationsByUserIdRoute } from "./organizations/get-organizations-by-user-id";
import { shutdownOrganizationRoute } from "./organizations/shutdown-organization";
import { transferOrganizationRoute } from "./organizations/transfer-organization";
import { updateOrganizationRoute } from "./organizations/update-organization";
import { createProjectRoute } from "./projects/create-project";
import { deleteProjectRoute } from "./projects/delete-project";
import { authenticateWithEmailAndPasswordRoute } from "./session/authenticate-with-email-and-password";
import { authenticateWithGithubRoute } from "./session/authenticate-with-github";
import { passwordRecoverRoute } from "./session/password-recover/password-recover.route";
import { passwordResetRoute } from "./session/password-reset/password-reset.route";
import { createUserAccountRoute } from "./users/create-user-account";
import { userProfileRoute } from "./users/user-profile";

export async function routes(app: FastifyInstance) {
  // Authentication
  authenticateWithEmailAndPasswordRoute(app);
  authenticateWithGithubRoute(app);
  passwordRecoverRoute(app);
  passwordResetRoute(app);

  // Users
  userProfileRoute(app);
  createUserAccountRoute(app);

  // Organizations
  getOrganizationsByUserIdRoute(app);
  createOrganizationRoute(app);
  getOrganizationRoute(app);
  updateOrganizationRoute(app);
  getMembershipRoute(app);
  shutdownOrganizationRoute(app);
  transferOrganizationRoute(app);

  // Organizations -> Projects
  createProjectRoute(app);
  deleteProjectRoute(app);
}
