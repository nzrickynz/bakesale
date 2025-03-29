import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Super Admin routes
    if (path.startsWith("/admin/super")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Organization Admin routes
    if (path.startsWith("/org/")) {
      if (token?.role !== "ORG_ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Volunteer routes
    if (path.startsWith("/volunteer-dashboard")) {
      if (token?.role !== "VOLUNTEER") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Dashboard routes - prevent volunteers from accessing
    if (path.startsWith("/dashboard")) {
      if (token?.role === "VOLUNTEER") {
        return NextResponse.redirect(new URL("/volunteer-dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/org/:path*",
    "/volunteer-dashboard/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/api/dashboard/:path*",
    "/api/orgs/:path*",
  ],
}; 