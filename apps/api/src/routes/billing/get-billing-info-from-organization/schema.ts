import { z } from "zod";

export const getBillingInfoFromOrganizationSchema = {
  tags: ["billing"],
  summary: "Get billing information for an organization",
  description:
    "Returns billing details including costs for projects ($20 each) and billable members ($10 each, excluding BILLING role)",
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      data: z.object({
        billing: z.object({
          seats: z.object({
            amount: z.number().int().min(0),
            unit: z.number(),
            price: z.number().min(0),
          }),
          projects: z.object({
            amount: z.number().int().min(0),
            unit: z.number(),
            price: z.number().min(0),
          }),
          total: z.object({
            amount: z.number().min(0),
            unit: z.string(),
          }),
        }),
      }),
    }),
  },
};
