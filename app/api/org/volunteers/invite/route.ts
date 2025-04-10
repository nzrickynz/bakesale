import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to send invitations" },
        { status: 401 }
      );
    }

    // Get the user's organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg) {
      return new NextResponse("User not found in any organization", { status: 404 });
    }

    const { email, role, listingId } = await request.json();

    if (!email || !role || !listingId) {
      return NextResponse.json(
        { message: "Email, role, and listing ID are required" },
        { status: 400 }
      );
    }

    // Check if the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        cause: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    // Use listing.cause.organization.id for organizationId
    const organizationId = listing.cause.organization.id;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      // Check if the user is already a volunteer for the listing
      const existingVolunteer = await prisma.userOrganization.findFirst({
        where: {
          userId: existingUser.id,
          assignedListings: {
            some: {
              id: listingId,
            },
          },
        },
      });

      if (existingVolunteer) {
        return NextResponse.json(
          { message: "This user is already a volunteer for this listing" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.volunteerInvitation.findFirst({
      where: {
        email,
        status: "PENDING",
        organizationId: organizationId, // Use the correct organizationId
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { message: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create the invitation
    const invitation = await prisma.volunteerInvitation.create({
      data: {
        email,
        role,
        token,
        organizationId: organizationId, // Use the correct organizationId
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send the invitation email
    await sendInvitationEmail({
      to: email,
      token: token,
      organizationName: listing.title, // Use listing title for context
      role,
      invitedByName: session.user.name || "Organization Admin",
    });

    return NextResponse.json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { message: "Failed to send invitation" },
      { status: 500 }
    );
  }
} 