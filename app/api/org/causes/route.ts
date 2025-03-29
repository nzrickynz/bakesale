import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user's organization through UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Get all causes for the organization
    const causes = await prisma.cause.findMany({
      where: {
        organizationId: userOrg.organization.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ causes });
  } catch (error) {
    console.error("Error fetching causes:", error);
    return NextResponse.json(
      { message: "Error fetching causes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      title,
      description,
      targetGoal,
      startDate,
      endDate,
      status = "DRAFT",
    } = body;

    // Get the user's organization through UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Create the cause
    const cause = await prisma.cause.create({
      data: {
        title,
        description,
        targetGoal,
        status,
        startDate,
        endDate,
        organizationId: userOrg.organization.id,
      },
    });

    return NextResponse.json({ cause });
  } catch (error) {
    console.error("Error creating cause:", error);
    return NextResponse.json(
      { message: "Error creating cause" },
      { status: 500 }
    );
  }
} 