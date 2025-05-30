import { z } from "zod";

export const getProjectsSchema = {
  tags: ["projects"],
  summary: "Get all projects from an organization",
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
        projects: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            avatarUrl: z.string().nullable(),
            ownerId: z.string().uuid(),
            organizationId: z.string().uuid(),
            createdAt: z.date(),
            updatedAt: z.date(),
            owner: z.object({
              id: z.string().uuid(),
              name: z.string().nullable(),
              email: z.string().nullable(),
              avatarUrl: z.string().nullable(),
            }),
          })
        ),
      }),
    }),
  },
};
