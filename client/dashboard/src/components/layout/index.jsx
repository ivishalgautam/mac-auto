"use client";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-client-provider";
import { usePathname } from "next/navigation";
import RoleContext from "@/providers/role-context";
import SidebarContext from "@/providers/sidebar-context";

export default function Layout({ children }) {
  const pathname = usePathname();
  const getContent = () => {
    if (["/", "/signup", "/unauthorized"].includes(pathname)) {
      return children;
    }

    return (
      <AuthProvider>
        <RoleContext>
          <SidebarContext>{children}</SidebarContext>
        </RoleContext>
      </AuthProvider>
    );
  };

  return <QueryProvider>{getContent()}</QueryProvider>;
}
