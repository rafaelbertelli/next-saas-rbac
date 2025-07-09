import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
      <form className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" id="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="psw">Senha</Label>
          <Input name="psw" id="psw" type="password" required />
          <Link
            href={"/auth/forgot-password"}
            className="text-foreground text-sm font-medium hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" className="w-full">
          Entrar
        </Button>

        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/auth/sign-up">Crie sua conta</Link>
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
          Entrar com GitHub
        </Button>
      </form>
    </>
  );
}
