import { z } from "zod";

export const updateOrganizationSchema = {
  tags: ["organizations"],
  summary: "Update organization details",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    domain: z.string().optional(),
    shouldAttachUsersByDomain: z.boolean().optional(),
  }),
  response: {
    204: z.null(),
  },
};
