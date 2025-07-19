"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 1 * 24 * 60 * 60; // 1 dia

export async function getAuthToken() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);

  cookieStore.set(COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function deleteAuthToken() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated() {
  const token = await getAuthToken();

  return !!token;
}
