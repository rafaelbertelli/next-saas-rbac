import { z } from "zod";

export const createInviteSchema = {
  tags: ["invites"],
  summary: "Create a new invite",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(["ADMIN", "MEMBER", "BILLING"]),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        inviteId: z.string().uuid(),
      }),
    }),
  },
};
