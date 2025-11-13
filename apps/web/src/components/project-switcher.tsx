"use client";

import { getProjectsHttp } from "@/http/get-projects";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Skeleton } from "./ui/skeleton";

export default function ProjectSwitcher() {
  const { orgSlug, projectSlug } = useParams<{
    orgSlug: string;
    projectSlug: string;
  }>();
  console.log(orgSlug, projectSlug);

  const { data: result, isLoading } = useQuery({
    queryKey: [orgSlug, "projects"],
    queryFn: () => getProjectsHttp(orgSlug),
    enabled: !!orgSlug,
  });
  const projects = result?.data.projects;
  const currentProject = projects?.find((p) => p.slug === projectSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-primary flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2">
        {isLoading ? (
          <>
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-full" />
          </>
        ) : currentProject ? (
          <>
            <Avatar className="size-4">
              {currentProject.avatarUrl && (
                <AvatarImage src={currentProject.avatarUrl} />
              )}
              <AvatarFallback />
            </Avatar>
            <span className="truncate text-left">{currentProject.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select project</span>
        )}

        {isLoading ? (
          <Loader2 className="text-muted-foreground ml-auto size-4 shrink-0 animate-spin" />
        ) : (
          <ChevronsUpDown className="text-muted-foreground ml-auto size-4 shrink-0" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects?.map((project) => (
            <DropdownMenuItem key={project.id} asChild>
              <Link href={`/org/${orgSlug}/project/${project.slug}`}>
                <Avatar className="mr-2 size-5">
                  {project.avatarUrl && <AvatarImage src={project.avatarUrl} />}
                  <AvatarFallback />
                </Avatar>
                <span className="line-clamp-1">{project.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/org/${orgSlug}/create-project`}>
            <PlusCircle className="mr-2 size-5" />
            Create Project
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
