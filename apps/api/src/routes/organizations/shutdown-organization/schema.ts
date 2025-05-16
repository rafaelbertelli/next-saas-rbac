import { z } from "zod";

export const shutdownOrganizationSchema = {
  tags: ["organizations"],
  summary: "Shutdown organization",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    204: z.null(),
  },
};
