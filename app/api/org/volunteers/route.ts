import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserOrganization, User } from "@prisma/client";

type VolunteerWithUser = UserOrganization & {
  user: User;
};

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the organization
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!userOrg || !["ORG_ADMIN", "SUPER_ADMIN"].includes(userOrg.role)) {
      return NextResponse.json(
        { error: "Unauthorized to view volunteers" },
        { status: 403 }
      );
    }

    // Get all volunteers for the organization
    const volunteers = await prisma.userOrganization.findMany({
      where: {
        organizationId,
        role: "VOLUNTEER",
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      volunteers: volunteers.map((v: VolunteerWithUser) => ({
        id: v.user.id,
        name: v.user.name,
        email: v.user.email,
        role: v.role,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("[VOLUNTEERS] Error fetching volunteers:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
} 