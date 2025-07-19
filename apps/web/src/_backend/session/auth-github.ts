"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "github_oauth_state";
const COOKIE_MAX_AGE = 60 * 5; // 5 minutos

export async function getGithubOAuthState() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setGithubOAuthState(state: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function deleteGithubOAuthState() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
