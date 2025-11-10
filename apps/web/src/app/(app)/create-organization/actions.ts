"use server";

import { createOrganizationHttp } from "@/http/create-organization";
import { HTTPError } from "ky";
import { OrganizationSchema } from "./schema";
import { OrganizationState } from "./types";

export async function createOrgenization(
  formData: FormData
): Promise<OrganizationState> {
  const result = OrganizationSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
    shouldAttachUsersByDomain:
      formData.get("shouldAttachUsersByDomain") === "on",
  });

  if (!result.success) {
    return {
      message: "Erro ao criar organização. Tente novamente mais tarde.",
      hasError: true,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, domain, shouldAttachUsersByDomain } = result.data;

  try {
    await createOrganizationHttp({ name, domain, shouldAttachUsersByDomain });

    return {
      message: "Organização criada com sucesso",
      hasError: false,
      errors: {},
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json();

      console.error("Erro ao criar organização:", { message });

      return {
        message: "Erro ao criar organização. Tente novamente mais tarde.",
        hasError: true,
        errors: {},
      };
    }

    return {
      message: "Erro ao criar organização. Tente novamente mais tarde.",
      hasError: true,
      errors: {},
    };
  }
}
