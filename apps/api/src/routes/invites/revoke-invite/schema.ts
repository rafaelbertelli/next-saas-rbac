import { z } from "zod";

export const revokeInviteSchema = {
  tags: ["organizations", "invites"],
  summary: "Revoke an invite",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
    inviteId: z.string().uuid(),
  }),
  response: {
    204: z.null(),
  },
};
