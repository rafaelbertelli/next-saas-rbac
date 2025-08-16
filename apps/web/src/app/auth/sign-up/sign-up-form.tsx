"use client";

import { signInWithGithub } from "@/_backend/session/sign-in-with-github";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";
import { useFormState } from "@/hooks/use-form-state";
import { AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { signUpWithEmailAndPassword } from "./actions";
import { INITIAL_STATE } from "./constants";
import { SignUpState } from "./types";

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const { state, handleSubmit, isPending } = useFormState<SignUpState>(
    signUpWithEmailAndPassword,
    INITIAL_STATE,
    (state) => {
      if (!state.hasError) {
        redirect("/auth/sign-in");
      }
    }
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {state.hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Erro ao criar conta</AlertTitle>
            <AlertDescription>
              <span className="text-xs">{state.message}</span>
            </AlertDescription>
          </Alert>
        )}

        <FormInput
          label="Nome"
          name="name"
          type="text"
          error={state.errors.name?.[0]}
          disabled={isPending}
          required
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          error={state.errors.email?.[0]}
          disabled={isPending}
          required
        />

        <FormInput
          label="Senha"
          name="password"
          type="password"
          error={state.errors.password?.[0]}
          disabled={isPending}
          required
        />

        <FormInput
          label="Confirmar senha"
          name="passwordConfirmation"
          type="password"
          error={state.errors.passwordConfirmation?.[0]}
          disabled={isPending}
          required
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
        </Button>

        <Button
          variant="link"
          size="sm"
          className="w-full"
          asChild
          disabled={isPending}
        >
          <Link href="/auth/sign-in">Já tenho uma conta</Link>
        </Button>

        <Separator />

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isPending}
          onClick={() => signInWithGithub()}
        >
          <Image
            src="/github-mark.svg"
            alt="GitHub Icon"
            className="size-4 dark:invert"
            width={16}
            height={16}
          />
          Entrar com GitHub
        </Button>
      </form>
    </div>
  );
}
