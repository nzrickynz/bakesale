import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to view volunteers" },
        { status: 401 }
      );
    }

    // Get the user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { message: "You must be part of an organization to view volunteers" },
        { status: 403 }
      );
    }

    // Get all volunteers for the organization
    const volunteers = await prisma.userOrganization.findMany({
      where: {
        organizationId: userOrg.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      volunteers: volunteers.map((v) => ({
        id: v.user.id,
        name: v.user.name,
        email: v.user.email,
        role: v.role,
        joinedAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { message: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
} 