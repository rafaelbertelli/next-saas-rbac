import { z } from "zod";

export const getOrganizationSchema = {
  tags: ["organizations"],
  summary: "Get an organization by slug",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        organization: z.object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string(),
          domain: z.string().nullish(),
          avatarUrl: z.string().nullish(),
          shouldAttachUsersByDomain: z.boolean(),
          ownerId: z.string().uuid(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      }),
    }),
  },
};
