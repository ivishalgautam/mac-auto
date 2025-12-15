import { NextResponse } from "next/server";
import { sidebarData } from "./data/routes";

const filteredRoutes = sidebarData.flatMap((item) =>
  item.items.length
    ? [item.url, ...item.items.map(({ url }) => url)]
    : item.url,
);
const filteredDynamicRoutes = sidebarData
  .flatMap((item) =>
    item.items.length
      ? [item.url, ...item.items.map(({ url }) => url)]
      : [item.url],
  )
  .filter((url) => url.includes(":"));

const AUTH_ROUTES = ["/", "/register"];
const PRIVATE_ROUTES = [...new Set(filteredRoutes)];
const DYNAMIC_PRIVATE_ROUTES = filteredDynamicRoutes.map((url) =>
  url.replace(/:\w+/g, "*"),
);

export default async function middleware(req) {
  const token = req.cookies.get("refresh_token")?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  if (token && AUTH_ROUTES.includes(pathname)) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    !token &&
    (PRIVATE_ROUTES.some((path) => pathname.startsWith(path)) ||
      DYNAMIC_PRIVATE_ROUTES.some((path) => pathname.startsWith(path)))
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
    "/products/:path*",
  ],
};
