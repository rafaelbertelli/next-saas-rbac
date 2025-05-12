import { userSchema } from "@/entities/User.entity";
import { z } from "zod";

export const profileSchema = {
  tags: ["users"],
  summary: "Get the current user's profile",
  description: "Get the current user's profile",
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        user: userSchema,
      }),
    }),
    404: z.object({
      message: z.string(),
    }),
  },
};
