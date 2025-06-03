import { roleSchema } from "@repo/auth";
import { z } from "zod";

export const getMembersSchema = {
  tags: ["members"],
  summary: "Get all members from an organization",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    organizationSlug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        members: z.array(
          z.object({
            id: z.string().uuid(),
            role: roleSchema,
            user: z.object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().email().nullable(),
              avatarUrl: z.string().url().nullable(),
            }),
          })
        ),
      }),
    }),
  },
};
