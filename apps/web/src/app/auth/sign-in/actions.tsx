"use server";

import { signInWithPassword } from "@/http/sign-in-with-password";
import { delay } from "@/lib/delay";

export async function signInWithEmailAndPassword(
  previousState: unknown,
  formData: FormData
) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  }

  const response = await signInWithPassword({
    email: String(email),
    password: String(password),
  });

  await delay(3000);

  return {
    token: response.data.token,
  };
}
