import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PRIVATE_ROUTES = ["/products"];
const DYNAMIC_PRIVATE_ROUTES = ["/products"];
const PUBLIC_ROUTES = ["/", "/about", "/contact"];

export default async function middleware(req) {
  const token = req.cookies.get("refresh_token")?.value;
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  if (token && AUTH_ROUTES.some((path) => pathname.startsWith(path))) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (PUBLIC_ROUTES.includes(pathname) || AUTH_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }
  if (
    !token &&
    (PRIVATE_ROUTES.some((path) => pathname.startsWith(path)) ||
      DYNAMIC_PRIVATE_ROUTES.some((path) => pathname.startsWith(path)))
  ) {
    url.pathname = "/unauthorized";
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
