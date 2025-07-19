import { setAuthCookies } from "@/app/auth/_backend/auth";
import { signInWithGithubHttp } from "@/http/sign-in-with-github";
import { HTTPError } from "ky";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      throw new Error("Github oauth code not provided");
    }

    const { data } = await signInWithGithubHttp({ code });

    await setAuthCookies(data.token);
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json();
      console.error("Erro ao realizar login:", { message });
    }

    return NextResponse.json(
      { message: "Erro ao realizar login. Tente novamente mais tarde." },
      { status: 400 }
    );
  }

  const redirectURL = new URL(request.nextUrl.clone());
  redirectURL.searchParams.delete("code");
  redirectURL.pathname = "/";

  return NextResponse.redirect(redirectURL);
}
