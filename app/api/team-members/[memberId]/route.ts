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
    await prisma.userOrganization.update({
      where: {
        userId_organizationId: {
          userId: params.memberId,
          organizationId,
        },
      },
      data: {
        assignments: {
          set: assignments.map((assignment: { id: string; type: string }) => ({
            id: assignment.id,
            type: assignment.type,
          })),
        },
      },
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