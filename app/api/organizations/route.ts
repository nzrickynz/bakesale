import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("[ORGANIZATIONS_GET] No authenticated user");
      return NextResponse.json({ organizations: [] });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    console.log("[ORGANIZATIONS_GET] Found organizations:", organizations.length);
    return NextResponse.json({ organizations: organizations || [] });
  } catch (error) {
    console.error("[ORGANIZATIONS_GET] Unexpected error:", error);
    return NextResponse.json({ organizations: [] });
  }
} 