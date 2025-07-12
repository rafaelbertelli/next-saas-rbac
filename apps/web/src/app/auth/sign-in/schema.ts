import { z } from "zod";

export const SignInWithEmailAndPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});
