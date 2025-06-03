import { roleSchema } from "@repo/auth";
import { z } from "zod";

export const updateMemberSchema = {
  tags: ["members"],
  summary: "Update a member",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    organizationSlug: z.string(),
    memberId: z.string().uuid(),
  }),
  body: z.object({
    role: roleSchema,
  }),
  response: {
    204: z.null(),
  },
};
