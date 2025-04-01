import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CauseService } from "@/lib/services/cause";
import { OrganizationService } from "@/lib/services/organization";
import { UserService } from "@/lib/services/user";
import { CauseStatus, UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
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
    const hasAccess = await userService.hasOrganizationAccess(user.id, params.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized to create causes" },
        { status: 403 }
      );
    }

    const { title, description, imageUrl, targetGoal, startDate, endDate, status } = await request.json();

    // Validate required fields
    if (!title || !description || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !Object.values(CauseStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const causeService = new CauseService();
    const cause = await causeService.create({
      data: {
        title,
        description,
        imageUrl,
        targetGoal,
        startDate,
        endDate,
        organization: {
          connect: {
            id: params.id,
          },
        },
        status: status || CauseStatus.ACTIVE,
      },
    });

    return NextResponse.json({
      success: true,
      data: cause,
    });
  } catch (error) {
    console.error("[CAUSES] Error creating cause:", error);
    return NextResponse.json(
      { error: "Failed to create cause" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const causeService = new CauseService();
    const causes = await causeService.findByOrganization(params.id);

    return NextResponse.json({
      causes,
    });
  } catch (error) {
    console.error('Error fetching causes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch causes' },
      { status: 500 }
    );
  }
} 