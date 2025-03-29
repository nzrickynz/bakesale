import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCauseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  targetGoal: z.number().min(0, "Target goal must be greater than 0"),
  startDate: z.date(),
  endDate: z.date(),
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
    const validatedData = createCauseSchema.parse(body);

    // Check if user has access to the organization
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: validatedData.organizationId,
      },
    });

    if (!userOrganization) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create the cause
    const cause = await prisma.cause.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        targetGoal: validatedData.targetGoal,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        status: "ACTIVE",
        organizationId: validatedData.organizationId,
      },
    });

    return NextResponse.json(cause);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to create cause:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all causes where the user is associated with the organization
    const causes = await prisma.cause.findMany({
      where: {
        organization: {
          userOrganizations: {
            some: {
              userId: user.id,
            },
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        donations: {
          where: {
            status: "COMPLETED",
          },
          select: {
            amount: true,
          },
        },
      },
    });

    // Calculate current amount for each cause
    const causesWithAmounts = causes.map(cause => ({
      ...cause,
      currentAmount: cause.donations.reduce((sum, donation) => sum + donation.amount, 0),
    }));

    return NextResponse.json({ causes: causesWithAmounts });
  } catch (error) {
    console.error("[CAUSES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 