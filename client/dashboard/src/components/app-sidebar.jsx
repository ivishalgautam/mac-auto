"use client";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROLES, sidebarData } from "@/data/routes";
import { useAuth } from "@/providers/auth-provider";
import { useMemo } from "react";
import { NavUser } from "./nav-user";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { H2, H3, H4 } from "./ui/typography";

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const { user, isUserLoading } = useAuth();
  const filteredRoutes = useMemo(() => {
    return sidebarData
      .filter((route) => route.roles.includes(user?.role) && route.isVisible)
      .map((item) => {
        return {
          ...item,
          items: item.items.filter(
            (item) => item.roles.includes(user?.role) && item.isVisible,
          ),
        };
      });
  }, [user]);

  function getSidebarDataForRole(role) {
    return filteredRoutes.map((item) => {
      const newItem = { ...item };

      if (newItem.title === "Customer Tickets" && role === ROLES.CUSTOMER) {
        newItem.title = "My Tickets";
      }
      if (newItem.title === "Dealer Tickets" && role === ROLES.DEALER) {
        newItem.title = "My Tickets";
      }

      return newItem;
    });
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <div>
        <div className="flex h-16 items-center justify-center p-2">
          {state === "expanded" ? (
            <Image
              src="/logo-dark.png"
              width={200}
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
        <H4 className={"text-accent text-center uppercase"}>{user?.role}</H4>
      </div>
      <SidebarContent>
        <ScrollArea>
          <NavMain items={getSidebarDataForRole(user?.role)} />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
