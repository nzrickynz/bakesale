import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { invitationId: string } }
) {
  try {
    const invitation = await prisma.VolunteerInvitation.findUnique({
      where: {
        id: params.invitationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { message: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
} 