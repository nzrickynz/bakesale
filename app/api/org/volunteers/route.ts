import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { UserRole, UserOrganization, User } from "@prisma/client";

type VolunteerWithUser = UserOrganization & {
  user: User;
};

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
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

    const userService = new UserService();
    const user = await userService.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has access to the organization
    const hasAccess = await userService.hasOrganizationAccess(user.id, organizationId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized to view volunteers" },
        { status: 403 }
      );
    }

    // Get all volunteers for the organization
    const volunteers = await userService.getOrganizationVolunteers(organizationId);

    return NextResponse.json({
      success: true,
      data: volunteers?.map((v: VolunteerWithUser) => ({
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

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, organizationId, role } = body;

    if (!userId || !organizationId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const user = await userService.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has access to modify roles
    const hasAccess = await userService.hasOrganizationAccess(user.id, organizationId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized to modify volunteer roles" },
        { status: 403 }
      );
    }

    // Update the user's role
    const updatedUserOrg = await userService.updateUserOrganizationRole(
      userId,
      organizationId,
      role
    );

    return NextResponse.json({
      success: true,
      data: updatedUserOrg,
    });
  } catch (error) {
    console.error("[VOLUNTEERS] Error updating volunteer role:", error);
    return NextResponse.json(
      { error: "Failed to update volunteer role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const organizationId = searchParams.get("organizationId");

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: "User ID and Organization ID are required" },
        { status: 400 }
      );
    }

    const userService = new UserService();
    const user = await userService.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has access to remove volunteers
    const hasAccess = await userService.hasOrganizationAccess(user.id, organizationId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized to remove volunteers" },
        { status: 403 }
      );
    }

    // Remove the user from the organization
    await userService.removeUserFromOrganization(userId, organizationId);

    return NextResponse.json({
      success: true,
      message: "Volunteer removed successfully",
    });
  } catch (error) {
    console.error("[VOLUNTEERS] Error removing volunteer:", error);
    return NextResponse.json(
      { error: "Failed to remove volunteer" },
      { status: 500 }
    );
  }
} 