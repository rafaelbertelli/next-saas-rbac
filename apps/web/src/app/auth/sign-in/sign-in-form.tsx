"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";
import { useFormState } from "@/hooks/use-form-state";
import { AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signInWithEmailAndPassword } from "./actions";
import { INITIAL_STATE } from "./contants";
import { SignInWithEmailAndPasswordState } from "./types";

export default function SignInForm() {
  const { state, handleSubmit, isPending } =
    useFormState<SignInWithEmailAndPasswordState>(
      signInWithEmailAndPassword,
      INITIAL_STATE
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Erro ao realizar login</AlertTitle>
          <AlertDescription>
            <span className="text-xs">{state.message}</span>
          </AlertDescription>
        </Alert>
      )}

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

      <div className="space-y-1">
        <Link
          href={"/auth/forgot-password"}
          className="text-foreground text-sm font-medium hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

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
        <Link href="/auth/sign-up">Crie sua conta</Link>
      </Button>

      <Separator />

      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={isPending}
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
  );
}
