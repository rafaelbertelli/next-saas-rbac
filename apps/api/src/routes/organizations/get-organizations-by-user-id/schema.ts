import { roleSchema } from "@repo/auth";
import { z } from "zod";

export const getOrganizationsByUserIdSchema = {
  tags: ["organizations"],
  summary: "Get the organizations of the current user",
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        organizations: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
            domain: z.string().nullable(),
            avatarUrl: z.string().nullable(),
            role: roleSchema.nullable(),
          })
        ),
      }),
    }),
  },
};
