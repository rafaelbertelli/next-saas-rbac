import { z } from "zod";

export const deleteProjectSchema = {
  tags: ["projects"],
  summary: "Delete a project by id",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
    projectId: z.string().uuid(),
  }),
  response: {
    204: z.null(),
  },
};
