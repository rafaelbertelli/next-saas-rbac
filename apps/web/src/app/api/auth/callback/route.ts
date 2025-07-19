import {
  deleteGithubOAuthState,
  getGithubOAuthState,
} from "@/_backend/session/auth-github";
import { setAuthToken } from "@/_backend/session/auth-token";
import { GITHUB_OAUTH_FAILED_ERROR_PARAM } from "@/http/constants/http-params";
import { signInWithGithubHttp } from "@/http/sign-in-with-github";
import { HTTPError } from "ky";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const storedState = await getGithubOAuthState();

    if (!code) {
      throw new Error("Github oauth code not provided");
    }

    // Valida o state para prevenir CSRF
    if (!state || !storedState || state !== storedState) {
      throw new Error("Invalid state parameter");
    }

    // Limpa o cookie de state
    await deleteGithubOAuthState();

    const { data } = await signInWithGithubHttp({ code });

    // Salva o token
    await setAuthToken(data.token);

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Erro no callback do GitHub:", error);

    if (error instanceof HTTPError) {
      const { message } = await error.response.json();
      console.error("Detalhes do erro:", { message });
    }

    // Redireciona para login com mensagem de erro
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set("error", GITHUB_OAUTH_FAILED_ERROR_PARAM);

    return NextResponse.redirect(loginUrl);
  }
}
