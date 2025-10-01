"use server";

import { getMembershipHttp } from "@/http/get-membership";
import { getOrganizationSlug } from "./get-organization-slug";

export async function getMembership() {
  try {
    const slug = await getOrganizationSlug();

    if (!slug) {
      return {
        success: false,
        error: "Organização não selecionada",
      };
    }

    const { data } = await getMembershipHttp(slug);
    debugger;

    return {
      success: true,
      membership: data.membership,
      organization: data.organization,
      user: data.user,
    };
  } catch (error) {
    const msg = "Erro ao buscar memberships";
    console.error(msg, error);

    return {
      success: false,
      error: msg,
    };
  }
}
