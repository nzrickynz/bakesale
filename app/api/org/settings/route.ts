import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      facebookUrl,
      instagramUrl,
      websiteUrl,
    } = body;

    // Get the user's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userOrganizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user?.userOrganizations?.[0]?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Update the organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: user.userOrganizations[0].organization.id },
      data: {
        name,
        description,
        facebookUrl,
        instagramUrl,
        websiteUrl,
      },
    });

    return NextResponse.json({ organization: updatedOrganization });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { message: "Error updating organization" },
      { status: 500 }
    );
  }
} 