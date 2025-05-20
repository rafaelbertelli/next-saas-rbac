import { z } from "zod";

export const transferOrganizationSchema = {
  tags: ["organizations"],
  summary: "Transfer organization ownership",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    transferToUserId: z.string().uuid(),
  }),
  response: {
    204: z.null(),
  },
};
