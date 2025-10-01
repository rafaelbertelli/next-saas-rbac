import { getOrganizationSlug } from "@/_backend/organizations/get-organization-slug";
import { getOrganizations } from "@/_backend/organizations/get-organizations";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export async function OrganizationSwitcher() {
  const currentOrg = await getOrganizationSlug();
  const { organizations } = await getOrganizations();

  const currentOrganization = organizations?.find(
    (org) => org.slug === currentOrg
  );

  console.log({ currentOrg, currentOrganization });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-primary flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2">
        {/* <span className="text-muted-foreground">Select Organization</span> */}
        {currentOrganization ? (
          <>
            <Avatar className="mr-2 size-4">
              {currentOrganization.avatarUrl && (
                <AvatarImage src={currentOrganization.avatarUrl} />
              )}
              <AvatarFallback />
            </Avatar>
            <span className="truncate text-left">
              {currentOrganization.name}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">Select organization</span>
        )}
        <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {organizations?.map((org) => (
            <DropdownMenuItem key={org.id} asChild>
              <Link href={`/org/${org.slug}`}>
                <Avatar className="mr-2 size-5">
                  {org.avatarUrl && <AvatarImage src={org.avatarUrl} />}
                  <AvatarFallback />
                </Avatar>
                <span className="line-clamp-1">{org.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/create-organization">
            <PlusCircle className="mr-2 size-5" />
            Create Organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
