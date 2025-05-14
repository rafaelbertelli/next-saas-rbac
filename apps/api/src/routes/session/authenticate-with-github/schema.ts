import { z } from "zod";

export const authenticateWithGithubSchema = {
  tags: ["session"],
  summary: "Authenticate with Github",
  body: z.object({
    code: z.string(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      data: z.object({
        token: z.string(),
      }),
    }),
    502: z.object({
      message: z.string(),
    }),
  },
};

export const githubAccessTokenDataSchema = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.literal("bearer"),
});

export const githubUserDataSchema = z.object({
  id: z.number(),
  name: z.string().nullable().default(""),
  email: z.string().nullable().default(""),
  avatar_url: z.string().nullable().default(""),
});
