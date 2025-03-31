import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { VolunteerInvitationService } from "@/lib/services/volunteer-invitation";

export const dynamic = 'force-dynamic'

const userService = new UserService();
const invitationService = new VolunteerInvitationService();

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
    const userOrg = await userService.findUnique({
      where: { id: session.user.id },
      include: {
        userOrganizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userOrg?.userOrganizations?.[0]) {
      return NextResponse.json(
        { message: "You must be part of an organization to view invitations" },
        { status: 403 }
      );
    }

    const organizationId = userOrg.userOrganizations[0].organizationId;

    // Get all invitations for the organization
    const invitations = await invitationService.findByOrganization(organizationId);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
} 