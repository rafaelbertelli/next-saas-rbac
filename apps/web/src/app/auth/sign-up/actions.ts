"use server";

import { signUpHttp } from "@/http/sign-up";
import { HTTPError } from "ky";
import { SignUpSchema } from "./schema";
import { SignUpState } from "./types";

export async function signUpWithEmailAndPassword(
  formData: FormData
): Promise<SignUpState> {
  const result = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!result.success) {
    return {
      message: "Erro ao criar conta. Tente novamente mais tarde.",
      hasError: true,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  try {
    await signUpHttp({ name, email, password });

    return {
      message: "Conta criada com sucesso. Faça login para continuar.",
      hasError: false,
      errors: {},
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json();

      console.error("Erro ao criar conta:", { message });

      return {
        message: "Erro ao criar conta. Tente novamente mais tarde.",
        hasError: true,
        errors: {},
      };
    }

    return {
      message: "Erro ao criar conta. Tente novamente mais tarde.",
      hasError: true,
      errors: {},
    };
  }
}
