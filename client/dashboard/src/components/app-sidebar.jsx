"use client";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarData } from "@/data/routes";
import { useAuth } from "@/providers/auth-provider";
import { useMemo } from "react";
import { NavUser } from "./nav-user";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const { user, isUserLoading } = useAuth();
  const filteredRoutes = useMemo(() => {
    return sidebarData
      .filter((route) => route.roles.includes(user?.role))
      .map((item) => {
        return {
          ...item,
          items: item.items.filter(
            (item) => item.roles.includes(user?.role) && item.isVisible,
          ),
        };
      });
  }, [user]);

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <div className="max-h-16 p-2">
        {state === "expanded" ? (
          <Image
            src="/logo.png"
            width={150}
            height={50}
            alt="Mac auto"
            className="mx-auto"
            loading="lazy"
          />
        ) : (
          <Image
            src="/logo-icon.png"
            width={30}
            height={30}
            alt="Mac auto"
            className="mx-auto"
            loading="lazy"
          />
        )}
      </div>
      <SidebarContent>
        <ScrollArea>
          <NavMain items={filteredRoutes} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {isUserLoading ? (
          <Skeleton className={"h-12 bg-white/5"} />
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
