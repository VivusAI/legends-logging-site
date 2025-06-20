import {
  ChartArea,
  Folders,
  KeyRound,
  Layers,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router";

const items = [
  {
    title: "Tokens",
    url: "tokens",
    icon: KeyRound,
    comingSoon: false,
  },
  {
    title: "Team",
    url: "#",
    icon: Users,
    comingSoon: true,
  },
  {
    title: "Usage",
    url: "#",
    icon: ChartArea,
    comingSoon: true,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    comingSoon: true,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="bg-gray-100 dark:bg-accent/20">
        <SidebarGroup>
          <SidebarGroupLabel>
            Fivemanage Lite ({import.meta.env.VITE_VERSION})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  {item.comingSoon && (
                    <SidebarMenuBadge>Coming soon</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
