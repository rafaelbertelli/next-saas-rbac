import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAuthenticated } from "../../_backend/session/auth-token";

interface AppLayoutProps {
  children: ReactNode;
  sheet: ReactNode;
}

export default async function AppLayout({ children, sheet }: AppLayoutProps) {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      {children}
      {sheet}
    </>
  );
}
