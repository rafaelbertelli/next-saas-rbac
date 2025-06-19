import { z } from "zod";

export const inviteStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);

export type InviteStatus = z.infer<typeof inviteStatusSchema>;
