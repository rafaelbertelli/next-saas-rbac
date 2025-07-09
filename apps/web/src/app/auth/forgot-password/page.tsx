import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      <form className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input name="email" id="email" type="email" required />
        </div>

        <Button type="submit" className="w-full">
          Recuperar senha
        </Button>

        <Button variant="link" size="sm" className="w-full" asChild>
          <Link href="/auth/sign-in">Voltar</Link>
        </Button>
      </form>
    </>
  );
}
