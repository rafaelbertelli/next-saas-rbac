import { FastifyInstance } from "fastify";

import { acceptInviteRoute } from "./invites/accept-invite/accept-invite.route";
import { createInviteRoute } from "./invites/create-invite/create-invite.route";
import { getInviteRoute } from "./invites/get-invite/get-invite.route";
import { getInvitesRoute } from "./invites/get-invites/get-invites.route";
import { getMembersRoute } from "./members/get-members";
import { removeMemberRoute } from "./members/remove-member";
import { updateMemberRoute } from "./members/update-member";
import { createOrganizationRoute } from "./organizations/create-organization";
import { getMembershipRoute } from "./organizations/get-membership";
import { getOrganizationRoute } from "./organizations/get-organization";
import { getOrganizationsByUserIdRoute } from "./organizations/get-organizations-by-user-id";
import { shutdownOrganizationRoute } from "./organizations/shutdown-organization";
import { transferOrganizationRoute } from "./organizations/transfer-organization";
import { updateOrganizationRoute } from "./organizations/update-organization";
import { createProjectRoute } from "./projects/create-project";
import { deleteProjectRoute } from "./projects/delete-project";
import { getProjectRoute } from "./projects/get-project/get-project.route";
import { getProjectsRoute } from "./projects/get-projects";
import { updateProjectRoute } from "./projects/update-project";
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
  updateProjectRoute(app);
  deleteProjectRoute(app);
  getProjectRoute(app);
  getProjectsRoute(app);

  // Organizations -> Members
  getMembersRoute(app);
  updateMemberRoute(app);
  removeMemberRoute(app);

  // Organizations -> Invites
  createInviteRoute(app);
  getInvitesRoute(app);

  // Invites
  getInviteRoute(app);
  acceptInviteRoute(app);
}
