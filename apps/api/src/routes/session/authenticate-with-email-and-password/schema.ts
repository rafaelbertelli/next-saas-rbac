import { z } from "zod";

export const authenticateWithEmailAndPasswordSchema = {
  tags: ["session"],
  summary: "Authenticate with email and password",
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        token: z.string(),
      }),
    }),
    401: z.object({
      message: z.string(),
    }),
  },
};
