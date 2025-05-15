import { roleSchema } from "@repo/auth";
import { z } from "zod";

export const GetMembershipSchema = {
  tags: ["organizations"],
  summary: "Get the membership on organization of the current user",
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
        membership: z.object({
          id: z.string(),
          role: roleSchema,
        }),
        organization: z.object({
          id: z.string(),
          name: z.string(),
        }),
      }),
    }),
  },
};
