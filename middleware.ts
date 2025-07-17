import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      console.log("Middleware: No token, redirecting to /admin/login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Rely on backend /auth/profile to validate token
  }

  if (token && pathname === "/admin/login") {
    console.log("Middleware: Token found, redirecting to /admin");
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
