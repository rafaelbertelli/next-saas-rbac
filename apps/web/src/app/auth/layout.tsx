import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { isAuthenticated } from "./_backend/auth";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isUserAuthenticated = await isAuthenticated();

  if (isUserAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs">{children}</div>
    </div>
  );
}
