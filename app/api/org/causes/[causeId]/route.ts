import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { causeId: string } }
) {
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

    // Get the cause
    const cause = await prisma.cause.findUnique({
      where: {
        id: params.causeId,
        organizationId: userOrg.organization.id,
      },
      include: {
        listings: true,
      },
    });

    if (!cause) {
      return NextResponse.json(
        { message: "Cause not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ cause });
  } catch (error) {
    console.error("Error fetching cause:", error);
    return NextResponse.json(
      { message: "Error fetching cause" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { causeId: string } }
) {
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
      status,
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

    // Update the cause
    const cause = await prisma.cause.update({
      where: {
        id: params.causeId,
        organizationId: userOrg.organization.id,
      },
      data: {
        title,
        description,
        targetGoal,
        startDate,
        endDate,
        status,
      },
    });

    return NextResponse.json({ cause });
  } catch (error) {
    console.error("Error updating cause:", error);
    return NextResponse.json(
      { message: "Error updating cause" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { causeId: string } }
) {
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

    // Delete the cause
    await prisma.cause.delete({
      where: {
        id: params.causeId,
        organizationId: userOrg.organization.id,
      },
    });

    return NextResponse.json({ message: "Cause deleted successfully" });
  } catch (error) {
    console.error("Error deleting cause:", error);
    return NextResponse.json(
      { message: "Error deleting cause" },
      { status: 500 }
    );
  }
} 