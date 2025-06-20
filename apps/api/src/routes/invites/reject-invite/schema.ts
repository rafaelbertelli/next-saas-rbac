import { z } from "zod";

export const rejectInviteSchema = {
  tags: ["invites"],
  summary: "Reject an invite",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    inviteId: z.string().uuid(),
  }),
  response: {
    204: z.null(),
  },
};
