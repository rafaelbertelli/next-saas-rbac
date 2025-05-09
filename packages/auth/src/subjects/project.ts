import { z } from "zod";
import { projectSchema } from "../models/project";

export const ProjectSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("create"),
    z.literal("delete"),
    z.literal("update"),
  ]),
  z.union([z.literal("Project"), projectSchema]),
]);

export type ProjectSubject = z.infer<typeof ProjectSubject>;
