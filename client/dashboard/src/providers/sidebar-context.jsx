import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React from "react";

export default function SidebarContext({ children }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-8">
          <div className="flex items-center gap-2 px-2">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div
          className={cn("w-[calc(100vw-var(--sidebar-width))] px-4 py-2", {
            "w-full": isMobile,
          })}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
