import { z } from "zod";

export const createOrganizationSchema = {
  tags: ["organizations"],
  summary: "Create a new organization",
  security: [
    {
      bearerAuth: [],
    },
  ],
  body: z.object({
    name: z.string(),
    domain: z.string().nullish(),
    shouldAttachUsersByDomain: z.boolean().optional(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        organizationId: z.string().uuid(),
      }),
    }),
  },
};
