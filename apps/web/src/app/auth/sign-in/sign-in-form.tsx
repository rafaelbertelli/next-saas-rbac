"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmailAndPassword } from "./actions";

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInWithEmailAndPassword,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {JSON.stringify(state)}
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input name="email" id="email" type="email" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <Input name="password" id="password" type="password" required />
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
