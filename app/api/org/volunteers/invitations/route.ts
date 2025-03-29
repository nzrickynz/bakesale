import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to view invitations" },
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
        { message: "You must be part of an organization to view invitations" },
        { status: 403 }
      );
    }

    // Get all invitations for the organization
    const invitations = await prisma.volunteerInvitation.findMany({
      where: {
        organizationId: userOrg.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
} 