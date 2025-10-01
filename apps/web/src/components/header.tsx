import { ability } from "@/_backend/session/auth-ability";
import { Slash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/globe.svg";
import { OrganizationSwitcher } from "./organization-switcher";
import { ProfileButton } from "./profile-button";

export async function Header() {
  const permissions = await ability();

  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image src={Logo} className="size-6 dark:invert" alt="Logo" />
        </Link>
        <Slash className="text-muted-foreground size-3 -rotate-25" />
        <OrganizationSwitcher />

        {permissions?.can("get", "Project") && <p>Projetos</p>}
      </div>

      <div className="flex items-center gap-4">
        <ProfileButton />
      </div>
    </div>
  );
}
