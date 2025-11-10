import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAuthenticated } from "../../_backend/session/auth-token";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
