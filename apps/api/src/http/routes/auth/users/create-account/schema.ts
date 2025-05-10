import { z } from "zod";

export const createAccountSchema = {
  tags: ["auth"],
  summary: "Create a new account",
  description: "Create a new account with the given name, email and password",
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  }),
};
