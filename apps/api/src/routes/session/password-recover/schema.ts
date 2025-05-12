import { z } from "zod";

export const passwordRecoverSchema = {
  tags: ["session"],
  summary: "Recover password",
  body: z.object({
    email: z.string().email(),
  }),
  response: {
    201: z.null(),
  },
};
