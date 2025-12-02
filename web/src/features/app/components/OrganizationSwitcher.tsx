"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useOrganizations } from "@/features/organizations/api/useOrganizations";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const { data: organizations, isLoading } = useOrganizations();
  const params = useParams();
  const navigate = useNavigate();

  if (isLoading) return null;
  if (!organizations || organizations.length === 0) return null;

  const activeOrganization = organizations.find((org) => org.id === params.organizationId) || organizations[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-base uppercase">
                <AvatarFallback className="rounded-lg">
                  {activeOrganization.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrganization.name}</span>
                <span className="truncate text-xs">ID: {activeOrganization.id}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations.filter(org => org.id !== activeOrganization.id).map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => navigate(`/app/${org.id}`)}
                className="gap-2 p-2"
              >
                <Avatar className="size-6 rounded-md text-sidebar-primary-foreground font-bold text-xs uppercase border">
                  <AvatarFallback className="rounded-md">
                    {org.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span>{org.name}</span>
                  <span className="text-xs text-muted-foreground">ID: {org.id}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => navigate("/app/new-organization") }>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add Organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
} 