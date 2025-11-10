import { z } from "zod";

export const SignUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(" ").length > 1, {
      message: "Preencha seu nome completo",
    }),
    email: z.email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });
