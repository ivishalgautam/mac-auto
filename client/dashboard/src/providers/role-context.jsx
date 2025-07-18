"use client";
import { sidebarData } from "@/data/routes";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "./auth-provider";

export default function RoleContext({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useContext(AuthContext);

  const protectedRoutes = useMemo(() => {
    const mainRoutes = sidebarData.map((data) => ({
      url: data.url,
      roles: data.roles,
    }));

    const subRoutes = sidebarData
      .flatMap((data) => data.items || [])
      .filter(Boolean) // Remove any undefined/null items
      .map((data) => ({
        url: data.url,
        roles: data.roles,
      }));

    return [...mainRoutes, ...subRoutes];
  }, []);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currRoute = pathname.replace(params.id || "", ":id");

    const protectedRoute = protectedRoutes.find((route) => {
      const routePattern = route.url.split("?")[0];
      return routePattern === currRoute;
    });

    if (!protectedRoute) return;

    const hasPermission = protectedRoute.roles.includes(user.role);

    if (!hasPermission) {
      router.replace("/unauthorized");
    }
  }, [user, params.id, pathname, router, isUserLoading, protectedRoutes]);

  return children;
}
