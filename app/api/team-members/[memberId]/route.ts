import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import prisma from "@/lib/prisma";

const userService = new UserService();

export async function PUT(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organizationId, assignments } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify the user has admin access
    const hasAdminAccess = await userService.hasAdminAccess(session.user.id, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Unauthorized to update team member" },
        { status: 403 }
      );
    }

    // Update team member assignments
    await prisma.$transaction(async (tx) => {
      // First, get the UserOrganization record
      const userOrg = await tx.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: params.memberId,
            organizationId,
          },
        },
      });

      if (!userOrg) {
        throw new Error("Team member not found");
      }

      // Handle listing assignments
      const listingAssignments = assignments
        .filter((assignment: { id: string; type: string }) => assignment.type === "listing")
        .map((assignment: { id: string }) => assignment.id);

      // Handle organization assignments
      const organizationAssignments = assignments
        .filter((assignment: { id: string; type: string }) => assignment.type === "organization")
        .map((assignment: { id: string }) => assignment.id);

      // Update listing assignments
      await tx.listing.updateMany({
        where: {
          id: {
            in: listingAssignments,
          },
        },
        data: {
          volunteerId: params.memberId,
        },
      });

      // Update organization assignments
      await tx.userOrganization.updateMany({
        where: {
          userId: params.memberId,
          organizationId: {
            in: organizationAssignments,
          },
        },
        data: {
          role: "ORG_ADMIN",
        },
      });
    });

    return NextResponse.json({ message: "Team member updated successfully" });
  } catch (error) {
    console.error("[TEAM_MEMBER_UPDATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify the user has admin access
    const hasAdminAccess = await userService.hasAdminAccess(session.user.id, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Unauthorized to remove team member" },
        { status: 403 }
      );
    }

    // Remove team member from organization
    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId: params.memberId,
          organizationId,
        },
      },
    });

    return NextResponse.json({ message: "Team member removed successfully" });
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
} 