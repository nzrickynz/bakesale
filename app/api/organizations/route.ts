import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force deployment
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("[ORGANIZATIONS_GET] Starting request")
    
    // Log auth options
    console.log("[ORGANIZATIONS_GET] Auth options:", {
      providers: authOptions.providers?.map(p => p.id),
      callbacks: Object.keys(authOptions.callbacks || {}),
      secret: !!authOptions.secret
    })

    const session = await getServerSession(authOptions);
    console.log("[ORGANIZATIONS_GET] Session:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    });

    if (!session?.user?.email) {
      console.log("[ORGANIZATIONS_GET] No authenticated user");
      return NextResponse.json({ organizations: [] });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    console.log("[ORGANIZATIONS_GET] Database user:", {
      found: !!dbUser,
      id: dbUser?.id,
      email: dbUser?.email
    });

    if (!dbUser) {
      console.log("[ORGANIZATIONS_GET] No database user found for email:", session.user.email);
      return NextResponse.json({ organizations: [] });
    }

    const organizations = await prisma.userOrganization.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log("[ORGANIZATIONS_GET] Found organizations:", {
      count: organizations.length,
      organizations: organizations.map(org => ({
        id: org.organization.id,
        name: org.organization.name,
        role: org.role
      }))
    });

    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    console.error("[ORGANIZATIONS_GET] Unexpected error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({ organizations: [] });
  }
} 