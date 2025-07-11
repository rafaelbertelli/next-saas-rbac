import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <>
      <form className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input name="name" id="name" type="text" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" id="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Senha</Label>
          <Input name="psw" id="psw" type="password" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password-confirmation">Confirme sua senha</Label>
          <Input
            name="psw-confirmation"
            id="psw-confirmation"
            type="password"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Criar conta
        </Button>

        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/auth/sign-in">Já tem uma conta? Entrar</Link>
        </Button>

        <Separator />

        <Button type="submit" variant="outline" className="w-full">
          <Image
            src="/github-mark.svg"
            alt="GitHub Icon"
            className="size-4 dark:invert"
            width={16}
            height={16}
          />
          Criar conta com GitHub
        </Button>
      </form>
    </>
  );
}
