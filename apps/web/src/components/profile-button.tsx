import { getUserProfile } from "@/_backend/users/get-user-profile";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export async function ProfileButton() {
  const { user } = await getUserProfile();

  function getInitials(name: string): string {
    if (!name) return ":)";
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase());
    return initials.join("");
  }

  const initials = getInitials(user.name ?? "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-muted-foreground text-xs">{user.email}</span>
        </div>
        <Avatar className="size-8">
          {!!user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <ChevronDown className="text-muted-foreground size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href="/api/auth/sign-out">
            <LogOut className="mr-2 size-4" />
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
