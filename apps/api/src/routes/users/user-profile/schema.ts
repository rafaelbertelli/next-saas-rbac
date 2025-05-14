import { z } from "zod";

export const userProfileSchema = {
  tags: ["users"],
  summary: "Get the current user's profile",
  description: "Get the current user's profile",
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: {
    200: z.object({
      data: z.object({
        user: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          name: z.string().nullable(),
          avatarUrl: z.string().url().nullable(),
        }),
      }),
    }),
    404: z.object({
      message: z.string(),
    }),
  },
};
