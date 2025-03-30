import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { UserOrganization, User } from "@prisma/client";

type TeamMember = UserOrganization & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type UserWithOrgs = User & {
  userOrganizations: UserOrganization[];
};

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

    // Get the current user with their organization memberships
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { userOrganizations: true },
    }) as UserWithOrgs | null;

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the user has admin access to the organization they're trying to add members to
    const hasAdminAccess = currentUser.userOrganizations.some(
      (uo: UserOrganization) => uo.organizationId === organizationId && ["ORG_ADMIN", "SUPER_ADMIN"].includes(uo.role)
    );

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Unauthorized to add team members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user is already a member of the organization
    const existingMember = await prisma.userOrganization.findFirst({
      where: {
        userId: existingUser.id,
        organizationId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Add the user to the organization
    const newMember = await prisma.userOrganization.create({
      data: {
        userId: existingUser.id,
        organizationId,
        role,
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

    // Get the current user with their organization memberships
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { userOrganizations: true },
    }) as UserWithOrgs | null;

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the user has admin access to the organization they're trying to add members to
    const hasAdminAccess = currentUser.userOrganizations.some(
      (uo: UserOrganization) => uo.organizationId === organizationId && ["ORG_ADMIN", "SUPER_ADMIN"].includes(uo.role)
    );

    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Unauthorized to view team members" },
        { status: 403 }
      );
    }

    // Get all team members for the organization
    const teamMembers = await prisma.userOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      teamMembers: teamMembers.map((member: TeamMember) => ({
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