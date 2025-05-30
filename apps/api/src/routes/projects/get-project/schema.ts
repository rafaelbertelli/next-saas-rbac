import { z } from "zod";

export const getProjectSchema = {
  tags: ["projects"],
  summary: "Get project details",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    organizationSlug: z.string(),
    projectSlug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
        avatarUrl: z.string().optional(),
        slug: z.string(),
        ownerId: z.string().uuid(),
        organizationId: z.string().uuid(),
        owner: z.object({
          id: z.string().uuid(),
          name: z.string().nullable(),
          email: z.string().nullable(),
          avatarUrl: z.string().nullable(),
        }),
      }),
    }),
  },
};
