import { z } from "zod";

export const createAccountSchema = {
  tags: ["users"],
  summary: "Create a new account",
  description: "Create a new account with the given name, email and password",
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  response: {
    201: z.object({
      data: z.object({
        user: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          name: z.string().nullable(),
          avatarUrl: z.string().url().nullable(),
        }),
      }),
    }),
    409: z.object({
      message: z.string(),
    }),
  },
};
