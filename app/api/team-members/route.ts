import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { UserRole } from "@prisma/client";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

const userService = new UserService();

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    console.log("Starting team member addition process...");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("No session or user ID found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);
    const { email, role, name, organizationId } = body;

    if (!organizationId) {
      console.error("No organization ID provided");
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    if (!email || !role) {
      console.error("Missing required fields:", { email, role });
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Verify the user has admin access
    console.log("Verifying admin access for user:", session.user.id);
    const hasAdminAccess = await userService.hasAdminAccess(session.user.id, organizationId);
    if (!hasAdminAccess) {
      console.error("User does not have admin access:", session.user.id);
      return NextResponse.json(
        { error: "Unauthorized to add team members" },
        { status: 403 }
      );
    }

    // Check if the user already exists
    console.log("Checking for existing user with email:", email);
    const existingUser = await userService.findUnique({
      where: { email },
    });

    if (!existingUser) {
      console.log("Checking for existing invitation");
      // Check for existing invitation
      const existingInvitation = await prisma.volunteerInvitation.findFirst({
        where: {
          email,
          organizationId,
          status: "PENDING",
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingInvitation) {
        console.log("Found existing pending invitation");
        return NextResponse.json(
          { error: "An invitation has already been sent to this email address" },
          { status: 400 }
        );
      }

      console.log("Creating invitation for new user:", email);
      
      // Generate an invitation token
      const token = randomBytes(32).toString('hex');
      
      try {
        // Store the invitation in the database
        console.log("Creating invitation record in database");
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
        console.log("Fetching organization details");
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId },
        });

        if (!organization) {
          console.error("Organization not found:", organizationId);
          return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 }
          );
        }

        // Send invitation email
        try {
          console.log("Sending invitation email to:", email);
          const { data, error } = await resend.emails.send({
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

          if (error) {
            console.error("Failed to send invitation email:", error);
            return NextResponse.json(
              { error: "Failed to send invitation email" },
              { status: 500 }
            );
          }

          console.log("Invitation email sent successfully:", data);
        } catch (emailError) {
          console.error("Error sending invitation email:", emailError);
          return NextResponse.json(
            { error: "Failed to send invitation email" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: "Invitation sent successfully",
          status: "invitation_sent"
        });
      } catch (dbError) {
        console.error("Database error creating invitation:", dbError);
        return NextResponse.json(
          { error: "Failed to create invitation" },
          { status: 500 }
        );
      }
    }

    // Check if the user is already a member of the organization
    console.log("Checking if user is already a team member");
    const isTeamMember = await userService.isTeamMember(existingUser.id, organizationId);
    if (isTeamMember) {
      console.error("User is already a team member:", existingUser.id);
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Add the user to the organization
    try {
      console.log("Adding user to organization:", { userId: existingUser.id, organizationId, role });
      const newMember = await userService.addTeamMember({
        userId: existingUser.id,
        organizationId,
        role: role as UserRole,
      });

      console.log("Team member added successfully:", newMember);
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
    } catch (addMemberError) {
      console.error("Error adding team member:", addMemberError);
      return NextResponse.json(
        { error: "Failed to add team member to organization" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[TEAM_MEMBERS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add team member" },
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

    // Get all pending invitations for the organization
    const pendingInvitations = await prisma.volunteerInvitation.findMany({
      where: {
        organizationId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Combine team members and pending invitations
    const membersWithStatus = teamMembers?.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      createdAt: member.createdAt,
      status: "ACTIVE",
    })) || [];

    const invitationsWithStatus = pendingInvitations.map((invitation) => ({
      id: invitation.id,
      name: null,
      email: invitation.email,
      role: invitation.role,
      createdAt: invitation.createdAt,
      status: "PENDING",
      invitationId: invitation.id,
    }));

    return NextResponse.json({
      teamMembers: [...membersWithStatus, ...invitationsWithStatus],
    });
  } catch (error) {
    console.error("[TEAM_MEMBERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invitationId, organizationId } = body;

    if (!invitationId || !organizationId) {
      return NextResponse.json(
        { error: "Invitation ID and organization ID are required" },
        { status: 400 }
      );
    }

    // Verify the user has admin access
    const hasAdminAccess = await userService.hasAdminAccess(session.user.id, organizationId);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: "Unauthorized to resend invitations" },
        { status: 403 }
      );
    }

    // Get the invitation
    const invitation = await prisma.volunteerInvitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Generate a new token
    const token = randomBytes(32).toString('hex');

    // Update the invitation with new token and expiration
    await prisma.volunteerInvitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send the invitation email
    const { data, error } = await resend.emails.send({
      from: "Bakesale <noreply@bakesale.co.nz>",
      to: invitation.email,
      subject: "You've been invited to join Bakesale",
      html: `
        <p>Hello,</p>
        <p>You've been invited to join ${invitation.organization.name} on Bakesale as a team member.</p>
        <p>Click the link below to create your account and get started:</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}">Create Account</a></p>
        <p>This invitation will expire in 7 days.</p>
      `,
    });

    if (error) {
      console.error("Failed to send invitation email:", error);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invitation resent successfully",
    });
  } catch (error) {
    console.error("[TEAM_MEMBERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to resend invitation" },
      { status: 500 }
    );
  }
} 