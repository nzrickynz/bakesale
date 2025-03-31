import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return null;
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  // Role-based access control for dashboard routes
  if (isDashboardPage) {
    const userRole = token.role as string;
    const path = request.nextUrl.pathname;

    // Super admin can access everything
    if (userRole === "SUPER_ADMIN") {
      return null;
    }

    // Organization admin routes
    if (path.includes("/organizations/") && path.includes("/settings")) {
      if (userRole !== "ORG_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Volunteer routes
    if (path.includes("/listings/")) {
      if (userRole !== "VOLUNTEER" && userRole !== "ORG_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 