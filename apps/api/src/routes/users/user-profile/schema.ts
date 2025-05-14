import { userSchema } from "@/entities/User.entity";
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
        user: userSchema,
      }),
    }),
    404: z.object({
      message: z.string(),
    }),
  },
};
