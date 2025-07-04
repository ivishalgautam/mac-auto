"use client";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/routes";
import { useAuth } from "@/providers/auth-provider";
import { useMemo } from "react";
import { NavUser } from "./nav-user";
import { Skeleton } from "./ui/skeleton";

export function AppSidebar({ ...props }) {
  const { user, isUserLoading } = useAuth();
  const filteredRoutes = useMemo(() => {
    return sidebarData
      .filter((route) => route.roles.includes(user?.role))
      .map((item) => {
        return {
          ...item,
          items: item.items.filter(
            (item) => item.roles.includes(user?.role) && item.isVisible
          ),
        };
      });
  }, [user]);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={filteredRoutes} />
      </SidebarContent>
      <SidebarFooter>
        {isUserLoading ? (
          <Skeleton className={"bg-white/5 h-12"} />
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
