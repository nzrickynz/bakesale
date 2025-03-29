import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "You must be logged in to decline an invitation" },
        { status: 401 }
      );
    }

    const invitation = await prisma.volunteerInvitation.findUnique({
      where: {
        id: params.invitationId,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { message: "This invitation has already been processed" },
        { status: 400 }
      );
    }

    if (invitation.email !== session.user.email) {
      return NextResponse.json(
        { message: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { message: "This invitation has expired" },
        { status: 400 }
      );
    }

    await prisma.volunteerInvitation.update({
      where: {
        id: params.invitationId,
      },
      data: {
        status: "DECLINED",
        declinedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Invitation declined successfully" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return NextResponse.json(
      { message: "Failed to decline invitation" },
      { status: 500 }
    );
  }
} 