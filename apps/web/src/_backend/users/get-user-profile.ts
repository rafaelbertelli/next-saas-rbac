import { getUserProfileHttp } from "@/http/get-user-profile";
import { redirect } from "next/navigation";

export async function getUserProfile() {
  try {
    const { data } = await getUserProfileHttp();

    return {
      user: data.user,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário =>", error);
  }

  redirect("/api/auth/sign-out");
}
