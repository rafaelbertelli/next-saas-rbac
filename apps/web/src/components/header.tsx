import { Slash } from "lucide-react";
import Image from "next/image";
import Logo from "../../public/globe.svg";
import { OrganizationSwitcher } from "./organization-switcher";
import { ProfileButton } from "./profile-button";

export function Header() {
  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Image src={Logo} className="size-6 dark:invert" alt="Logo" />
        <Slash className="text-muted-foreground size-3 -rotate-25" />
        <OrganizationSwitcher />
      </div>

      <div className="flex items-center gap-4">
        <ProfileButton />
      </div>
    </div>
  );
}
