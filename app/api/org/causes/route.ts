import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user";
import { CauseService } from "@/lib/services/cause";

const userService = new UserService();
const causeService = new CauseService();

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
    const user = await userService.findUnique({
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

    // Get all causes for the organization
    const causes = await causeService.findMany({
      where: {
        organizationId: user.userOrganizations[0].organization.id,
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
    const userOrg = await userService.findUnique({
      where: { email: session.user.email },
      include: {
        userOrganizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!userOrg?.userOrganizations?.[0]?.organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Create the cause
    const cause = await causeService.create({
      data: {
        title,
        description,
        targetGoal,
        status,
        startDate,
        endDate,
        organizationId: userOrg.userOrganizations[0].organization.id,
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