"use server";

import { getOrganizationsHttp } from "@/http/get-organizations";

export async function getUserOrganizations() {
  try {
    const { data } = await getOrganizationsHttp();

    return {
      organizations: data.organizations,
    };
  } catch (error) {
    console.error("Erro ao buscar organizações do usuário =>", error);

    return {
      organizations: [
        {
          id: "",
          name: "",
          slug: "",
          avatarUrl: null,
        },
      ],
    };
  }
}
