import { InviteStatus, Role } from "@/generated/prisma";
import { z } from "zod";

export const getPendingInvitesSchema = {
  tags: ["invites"],
  summary: "Get pending invites for current user",
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        invites: z.array(
          z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            role: z.nativeEnum(Role),
            status: z.nativeEnum(InviteStatus),
            organization: z.object({
              id: z.string().uuid(),
              name: z.string(),
              slug: z.string(),
              avatarUrl: z.string().nullable(),
            }),
            inviter: z.object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().email(),
            }),
            createdAt: z.string(),
            updatedAt: z.string(),
          })
        ),
      }),
    }),
  },
};
