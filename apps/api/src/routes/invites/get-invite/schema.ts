import { inviteStatusSchema, roleSchema } from "@repo/auth";
import { z } from "zod";

export const getInvitesSchema = {
  tags: ["invites"],
  summary: "Get invite",
  params: z.object({
    inviteId: z.string().uuid(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        invite: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          role: roleSchema,
          status: inviteStatusSchema,
          createdAt: z.date(),
          updatedAt: z.date(),
          inviter: z
            .object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().email(),
              avatarUrl: z.string().url().nullable(),
            })
            .nullable(),
          organization: z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
            avatarUrl: z.string().url().nullable(),
          }),
        }),
      }),
    }),
  },
};
