import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/register",
  "/_not-found",
  "/causes",
  "/causes/[causeId]",
  "/causes/[causeId]/listings/[listingId]",
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isInviteRegisterRoute = request.nextUrl.pathname.startsWith("/invite/register/");

  // Allow public routes without any checks
  if (isPublicRoute || isInviteRegisterRoute) {
    return null;
  }

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return null;
  }

  // Handle auth pages (login, register)
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return null;
  }

  // Handle protected routes
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

    // Volunteer-only routes
    if (path.startsWith("/volunteer-dashboard")) {
      if (userRole !== "VOLUNTEER") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // Allow access even if no listings are assigned
      // Volunteers can see a message like "no assigned listings"
    }
  }

  return null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|faviconb.ico).*)"],
}; 