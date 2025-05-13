import { z } from "zod";

export const resetPasswordSchema = {
  tags: ["session"],
  summary: "Reset password",
  body: z.object({
    token: z.string(),
    password: z.string().min(6),
  }),
  response: {
    204: z.null(),
    401: z.object({
      message: z.string(),
    }),
  },
};
