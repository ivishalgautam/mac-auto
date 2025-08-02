"use client";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-client-provider";
import { usePathname } from "next/navigation";
import RoleContext from "@/providers/role-context";
import SidebarContext from "@/providers/sidebar-context";
import { SidebarInset, SidebarTrigger, useSidebar } from "../ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppSidebar } from "../app-sidebar";
import { cn } from "@/lib/utils";

export default function Layout({ children }) {
  const pathname = usePathname();
  const getContent = () => {
    if (["/", "/signup", "/unauthorized"].includes(pathname)) {
      return children;
    }

    return (
      <AuthProvider>
        <RoleContext>
          <SidebarContext>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-8">
                <div className="flex items-center gap-2 px-2">
                  <SidebarTrigger className="-ml-1" />
                </div>
              </header>
              <Children>{children}</Children>
            </SidebarInset>
          </SidebarContext>
        </RoleContext>
      </AuthProvider>
    );
  };

  return <QueryProvider>{getContent()}</QueryProvider>;
}

function Children({ children }) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn("w-[calc(99vw-var(--sidebar-width))] px-4 py-2", {
        "w-full": typeof window !== "undefined" && isMobile,
        "w-[calc(99vw-var(--sidebar-icon-width))]": state === "collapsed",
      })}
    >
      {children}
    </div>
  );
}
