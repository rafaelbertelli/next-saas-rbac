"use server";

import { redirect } from "next/navigation";
import { setGithubOAuthState } from "./auth-github";

// TODO: move to .env when configure .env
const GITHUB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23liq7YIyeKDHMB7iH";

const GITHUB_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
  "http://localhost:3000/api/auth/callback";

export async function signInWithGithub() {
  if (!GITHUB_CLIENT_ID) {
    throw new Error("GitHub Client ID not configured");
  }

  const githubSignInURL = new URL(
    "login/oauth/authorize",
    "https://github.com"
  );

  // Adiciona um state parameter para segurança
  const state = Math.random().toString(36).substring(7);

  githubSignInURL.searchParams.set("client_id", GITHUB_CLIENT_ID);
  githubSignInURL.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
  githubSignInURL.searchParams.set("scope", "user");
  githubSignInURL.searchParams.set("state", state);

  // Armazena o state em um cookie seguro
  await setGithubOAuthState(state);

  redirect(githubSignInURL.toString());
}
