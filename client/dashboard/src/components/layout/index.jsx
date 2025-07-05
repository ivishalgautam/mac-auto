"use client";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-client-provider";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";

export default function Layout({ children }) {
  const pathname = usePathname();
  const getContent = () => {
    if (["/", "/signup", "/unauthorized"].includes(pathname)) {
      return children;
    }

    return (
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-8">
              <div className="flex items-center gap-2 px-2">
                <SidebarTrigger className="-ml-1" />
              </div>
            </header>
            <div className="px-4 py-2">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <QueryProvider>{getContent()}</QueryProvider>
    </div>
  );
}
