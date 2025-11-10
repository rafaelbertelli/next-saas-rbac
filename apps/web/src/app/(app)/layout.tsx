import { Header } from "@/components/header";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAuthenticated } from "../../_backend/session/auth-token";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="space-y-4 py-4">
      <Header />
      <main className="mx-auto w-full max-w-[1200px]">{children}</main>
    </div>
  );
}
