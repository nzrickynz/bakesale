import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CauseService } from "@/lib/services/cause";
import { OrganizationService } from "@/lib/services/organization";
import { UserService } from "@/lib/services/user";
import { CauseCategory, CauseStatus, UserRole } from "@prisma/client";

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

    // Check if user has admin access to the organization
    const hasAccess = await userService.hasOrganizationAccess(user.id, params.id, [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN]);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized to create causes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (body.category && !Object.values(CauseCategory).includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid cause category" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !Object.values(CauseStatus).includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid cause status" },
        { status: 400 }
      );
    }

    const causeService = new CauseService();
    const cause = await causeService.create({
      data: {
        ...body,
        organizationId: params.id,
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
        { error: "Unauthorized to view causes" },
        { status: 403 }
      );
    }

    const causeService = new CauseService();
    const causes = await causeService.findByOrganization(params.id);

    return NextResponse.json({
      success: true,
      data: causes,
    });
  } catch (error) {
    console.error("[CAUSES] Error fetching causes:", error);
    return NextResponse.json(
      { error: "Failed to fetch causes" },
      { status: 500 }
    );
  }
} 