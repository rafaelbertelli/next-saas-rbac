import { z } from "zod";

export const OrganizationSchema = z
  .object({
    name: z.string().min(4, "Nome deve ter pelo menos 4 caracteres"),
    domain: z
      .string()
      .min(4, "Domínio deve ter pelo menos 4 caracteres")
      .nullable()
      .refine(
        (val) => {
          if (val) {
            const domainRegex = /^[a-zA-Z0-9*-]+\.[a-zA-Z]{2,}?$/;
            return domainRegex.test(val);
          }
          return true;
        },
        { message: "Domínio inválido" }
      )
      .optional(),
    shouldAttachUsersByDomain: z
      .union([z.literal("on"), z.literal("off"), z.boolean()])
      .transform((val) => val === "on" || val === true)
      .default(false),
  })
  .refine(
    (data) => {
      if (data.shouldAttachUsersByDomain === true && !data.domain) {
        return false;
      }
      return true;
    },
    {
      message:
        "Para ativar essa opção, é necessário fornecer um domínio válido.",
      path: ["domain"],
    }
  );
