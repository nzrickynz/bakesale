import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { UserRole } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

const userService = new UserService();
const resend = new Resend(process.env.RESEND_API_KEY || 'ABC');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, role, name, organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
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

    // Check if the user already exists
    const existingUser = await userService.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Generate an invitation token
      const token = randomBytes(32).toString('hex');
      
      // Store the invitation in the database
      const invitation = await prisma.volunteerInvitation.create({
        data: {
          email,
          token,
          organizationId,
          role: role as UserRole,
          invitedById: session.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Get organization details for the email
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      // Send invitation email
      await resend.emails.send({
        from: "Bakesale <noreply@bakesale.co.nz>",
        to: email,
        subject: "You've been invited to join Bakesale",
        html: `
          <p>Hello,</p>
          <p>You've been invited to join ${organization.name} on Bakesale as a team member.</p>
          <p>Click the link below to create your account and get started:</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}">Create Account</a></p>
          <p>This invitation will expire in 7 days.</p>
        `,
      });

      return NextResponse.json({
        message: "Invitation sent successfully",
        status: "invitation_sent"
      });
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