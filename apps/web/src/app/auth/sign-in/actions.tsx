"use server";

import { signInWithPasswordHttp } from "@/http/sign-in-with-password";
import { HTTPError } from "ky";
import { redirect } from "next/navigation";
import { setAuthCookies } from "../_backend/auth";
import { SignInWithEmailAndPasswordSchema } from "./schema";
import { SignInWithEmailAndPasswordState } from "./types";

export async function signInWithEmailAndPassword(
  formData: FormData
): Promise<SignInWithEmailAndPasswordState> {
  const result = SignInWithEmailAndPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      message:
        "E-mail ou senha inválidos. Tente o login social ou recupere sua senha.",
      hasError: true,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  try {
    const { data } = await signInWithPasswordHttp({ email, password });

    await setAuthCookies(data.token);
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json();

      console.error("Erro ao realizar login:", { message });

      return {
        message:
          "E-mail ou senha inválidos. Tente o login social ou recupere sua senha.",
        hasError: true,
        errors: {},
      };
    }

    return {
      message: "Erro ao realizar login. Tente novamente em alguns minutos.",
      hasError: true,
      errors: {},
    };
  }

  redirect("/");
}
