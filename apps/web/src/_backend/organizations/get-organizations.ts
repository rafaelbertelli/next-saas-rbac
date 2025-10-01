"use server";

import { getOrganizationsHttp } from "@/http/get-organizations";

export async function getOrganizations() {
  try {
    const { data } = await getOrganizationsHttp();

    return {
      success: true,
      organizations: data.organizations ?? [],
    };
  } catch (error) {
    const msg = "Erro ao buscar organizações do usuário";
    console.error(msg, error);

    return {
      success: false,
      error: msg,
    };
  }
}
