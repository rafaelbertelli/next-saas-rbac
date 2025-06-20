import { inviteStatusSchema, roleSchema } from "@repo/auth";
import { z } from "zod";

export const getInvitesSchema = {
  tags: ["organizations", "invites"],
  summary: "Get organization invites",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        invites: z.array(
          z.object({
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
          })
        ),
      }),
    }),
  },
};
