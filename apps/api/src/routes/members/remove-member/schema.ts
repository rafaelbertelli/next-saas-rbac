import { z } from "zod";

export const removeMemberSchema = {
  tags: ["members"],
  summary: "Remove a member from organization",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    organizationSlug: z.string(),
    memberId: z.string().uuid(),
  }),
  response: {
    204: z.null(),
  },
};
