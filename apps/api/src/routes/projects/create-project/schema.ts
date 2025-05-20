import { z } from "zod";

export const createProjectSchema = {
  tags: ["projects"],
  summary: "Create a new project for an organization",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    name: z.string(),
    description: z.string(),
    avatarUrl: z.string().optional(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        projectId: z.string().uuid(),
      }),
    }),
  },
};
