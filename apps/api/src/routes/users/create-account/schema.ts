import { userSchema } from "@/entities/User.entity";
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
      message: z.string(),
      data: z.object({
        user: userSchema,
      }),
    }),
    409: z.object({
      message: z.string(),
    }),
  },
};
