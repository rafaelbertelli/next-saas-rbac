"use server";

import { env } from "@repo/env";
import { redirect } from "next/navigation";
import { setGithubOAuthState } from "./auth-github";

const GITHUB_OAUTH_CLIENT_ID = env.GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_REDIRECT_URI = env.GITHUB_OAUTH_REDIRECT_URI;
const GITHUB_OAUTH_IDENTITY_URI = env.GITHUB_OAUTH_IDENTITY_URI;

export async function signInWithGithub() {
  if (
    !GITHUB_OAUTH_CLIENT_ID ||
    !GITHUB_OAUTH_REDIRECT_URI ||
    !GITHUB_OAUTH_IDENTITY_URI
  ) {
    throw new Error("GitHub Client ID not configured");
  }

  // Adiciona um state parameter para segurança
  const state = Math.random().toString(36).substring(7);

  const githubSignInURL = new URL(GITHUB_OAUTH_IDENTITY_URI);
  githubSignInURL.searchParams.set("client_id", GITHUB_OAUTH_CLIENT_ID);
  githubSignInURL.searchParams.set("redirect_uri", GITHUB_OAUTH_REDIRECT_URI);
  githubSignInURL.searchParams.set("scope", "user");
  githubSignInURL.searchParams.set("state", state);

  // Armazena o state em um cookie seguro
  await setGithubOAuthState(state);

  redirect(githubSignInURL.toString());
}
