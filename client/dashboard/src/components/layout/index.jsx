"use client";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-client-provider";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import { SiteHeader } from "../site-header";
import ProtectedRouteProvider from "@/providers/protected-route-provider";
import { publicRoutes } from "@/data/routes";

export default function Layout({ children }) {
  const pathname = usePathname();
  const getContent = () => {
    if (publicRoutes.includes(pathname)) {
      return children;
    }

    return (
      <AuthProvider>
        <ProtectedRouteProvider>
          <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset className={"h-[calc(100%] overflow-hidden"}>
                  <div className="h-full p-4">{children}</div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </ProtectedRouteProvider>
      </AuthProvider>
    );
  };

  return (
    <div className="bg-gray-50">
      <QueryProvider>{getContent()}</QueryProvider>
    </div>
  );
}
