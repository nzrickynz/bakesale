import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendInvitationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  organizationId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = inviteSchema.parse(body);

    // Check if user has admin access to the organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: validatedData.organizationId,
        role: "ORG_ADMIN",
      },
    });

    if (!userOrganization) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the invited user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Check if the user is already a member of the organization
    if (existingUser) {
      const existingMember = await prisma.userOrganization.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: validatedData.organizationId,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
    }

    // Generate a unique token
    const token = randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await prisma.volunteerInvitation.create({
      data: {
        email: validatedData.email,
        organizationId: validatedData.organizationId,
        invitedById: user.id,
        role: "ORG_ADMIN",
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Get organization details for the email
    const organization = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Send invitation email
    await sendInvitationEmail({
      to: validatedData.email,
      organizationName: organization.name,
      invitationId: invitation.id,
      role: "ORG_ADMIN",
      invitedByName: user.name || "Organization Admin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to send invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 