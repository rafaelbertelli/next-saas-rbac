import { z } from "zod";

export const acceptInviteSchema = {
  tags: ["invites"],
  summary: "Accept an invite",
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
