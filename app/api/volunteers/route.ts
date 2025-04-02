import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { hash } from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, causeId, organizationId } = await req.json();

    // Verify the user is an admin of the organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        role: 'ORG_ADMIN',
      },
    });

    if (!userOrg) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the cause belongs to the organization
    const cause = await prisma.cause.findFirst({
      where: {
        id: causeId,
        organizationId,
      },
    });

    if (!cause) {
      return new NextResponse("Cause not found", { status: 404 });
    }

    // Check if the user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create a new user with a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hash(tempPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: 'VOLUNTEER',
        },
      });

      // Send invitation email with temporary password
      await resend.emails.send({
        from: "Bakesale <noreply@bakesale.co.nz>",
        to: email,
        subject: "Welcome to Bakesale - Your Temporary Password",
        html: `
          <p>Hello,</p>
          <p>You've been invited to join Bakesale as a volunteer.</p>
          <p>Your temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please log in at ${process.env.NEXT_PUBLIC_APP_URL}/login and change your password.</p>
        `,
      });
    }

    // Add user to organization if not already added
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      update: {
        role: 'VOLUNTEER',
      },
      create: {
        userId: user.id,
        organizationId,
        role: 'VOLUNTEER',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to add volunteer:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
