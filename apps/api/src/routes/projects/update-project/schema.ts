import { z } from "zod";

export const updateProjectSchema = {
  tags: ["projects"],
  summary: "Update a project",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    organizationSlug: z.string(),
    projectId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    avatarUrl: z.string().nullish(),
  }),
  response: {
    204: z.null(),
  },
};
