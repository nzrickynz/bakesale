import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { UserRole } from "@prisma/client";

const userService = new UserService();

export async function POST(request: Request) {
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
        { error: "Unauthorized to add team members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, name } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await userService.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user's name if provided
    if (name) {
      await userService.update(
        { id: existingUser.id },
        { name }
      );
    }

    // Check if the user is already a member of the organization
    const isTeamMember = await userService.isTeamMember(existingUser.id, organizationId);
    if (isTeamMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Add the user to the organization
    const newMember = await userService.addTeamMember({
      userId: existingUser.id,
      organizationId,
      role: role as UserRole,
    });

    return NextResponse.json({
      message: "Team member added successfully",
      teamMember: {
        id: newMember.user.id,
        name: newMember.user.name,
        email: newMember.user.email,
        role: newMember.role,
        createdAt: newMember.createdAt,
      },
    });
  } catch (error) {
    console.error("[TEAM_MEMBERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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
        { error: "Unauthorized to view team members" },
        { status: 403 }
      );
    }

    // Get all team members for the organization
    const teamMembers = await userService.getTeamMembers(organizationId);

    return NextResponse.json({
      teamMembers: teamMembers?.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        createdAt: member.createdAt,
      })),
    });
  } catch (error) {
    console.error("[TEAM_MEMBERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
} 