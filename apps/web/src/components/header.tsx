import { ability } from "@/_backend/session/auth-ability";
import { Slash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/globe.svg";
import { OrganizationSwitcher } from "./organization-switcher";
import { ProfileButton } from "./profile-button";
import ProjectSwitcher from "./project-switcher";
import { ThemeSwitcher } from "./theme/theme-switcher";
import { Separator } from "./ui/separator";

export async function Header() {
  const permissions = await ability();

  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-between border-b pb-2">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image src={Logo} className="size-6 dark:invert" alt="Logo" />
        </Link>
        <Slash className="text-muted-foreground size-3 -rotate-25" />
        <OrganizationSwitcher />

        {permissions?.can("get", "Project") && (
          <>
            <Slash className="text-muted-foreground size-3 -rotate-25" />
            <ProjectSwitcher />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Separator orientation="vertical" className="h-5" />
        <ProfileButton />
      </div>
    </div>
  );
}
